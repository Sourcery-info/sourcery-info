import { SourcerySub } from "@sourcery/queue/src/sub";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { updateFile, getFile } from "@sourcery/frontend/src/lib/classes/files";
import { Validate } from "./pipeline/validate";
import { ExtractText } from "./pipeline/extract_text";
import { ChunkingPipeline } from "./pipeline/chunk";
import { ContextualChunkPipeline } from "./pipeline/contextual-chunk";
import { VectorizeChunksPipeline, VectorizeEntitiesPipeline } from "./pipeline/vectorize";
import { DoclingPipeline } from "./pipeline/docling";
import { SavePipeline } from "./pipeline/save";
import { DonePipeline } from "./pipeline/done";
import { PDFToImagePipeline } from "./pipeline/pdftoimage";
import { EasyOCRPipeline } from "./pipeline/easyocr";
import { MarkerPDFPipeline } from "./pipeline/marker-pdf";
import { UnprocessedPipeline } from "./pipeline/unprocessed";
import { ErrorPipeline } from "./pipeline/error";
import { MammothPipeline } from "./pipeline/mammoth";
import { connectDB } from '@sourcery/frontend/src/lib/server/db';
import { stages } from "./file_workflows";
import { FileStage, FileStatus } from "@sourcery/common/types/SourceryFile.type";
import dotenv from "dotenv";
import { LLAMAMMPipeline } from "./pipeline/llama-mm";
import { EntitiesPipeline } from "./pipeline/entities";
import { MontagePipeline } from "./pipeline/montage";
import { FilenamePipeline } from "./pipeline/filename";
import { SourceryPub } from "@sourcery/queue/src/pub";
import { createAlert } from "@sourcery/frontend/src/lib/classes/alerts";
import { logger } from "@sourcery/common/src/logger";
import { FileModel } from "@sourcery/common/src/models/File.model";

dotenv.config();

const ws_pub = new SourceryPub("sourcery.info-ws");

function send_ws_message(file: SourceryFile, message?: string) {
    ws_pub.addJob(`${file.user_id}:file`, {
        id: file._id,
        file: file,
        message: message
    });
}

async function handleFile(file: SourceryFile) {
    const start_time = Date.now();
    let stage_instance = null;
    let stage = file.stage as FileStage;
    if (!stage) {
        stage = FileStage.UNPROCESSED;
    }
    
    // Set file status to processing
    if (stage !== FileStage.DONE) {
        file.status = FileStatus.PROCESSING;
        file.stage = stage;
        await updateFile(file);
        send_ws_message(file, `Processing ${stage}`);
    }

    switch (stage) {
        case FileStage.UNPROCESSED:
            stage_instance = new UnprocessedPipeline(file);
            break;
        case FileStage.VALIDATING:
            stage_instance = new Validate(file);
            break;
        case FileStage.DOCLING:
            stage_instance = new DoclingPipeline(file);
            break;
        case FileStage.ENTITY_EXTRACTION:
            stage_instance = new ExtractText(file);
            break;
        case FileStage.CHUNKING:
            stage_instance = new ChunkingPipeline(file);
            break;
        case FileStage.CONTEXTUAL_CHUNKING:
            stage_instance = new ContextualChunkPipeline(file);
            break;
        case FileStage.VECTORISING:
            stage_instance = new VectorizeChunksPipeline(file);
            break;
        case FileStage.VECTORISING_ENTITIES:
            stage_instance = new VectorizeEntitiesPipeline(file);
            break;
        case FileStage.SAVING:
            stage_instance = new SavePipeline(file);
            break;
        case FileStage.DONE:
            stage_instance = new DonePipeline(file);
            break;
        case FileStage.ERROR:
            stage_instance = new ErrorPipeline(file);
            break;
        case FileStage.PDF_TO_IMAGE:
            stage_instance = new PDFToImagePipeline(file);
            break;
        case FileStage.EASYOCR:
            stage_instance = new EasyOCRPipeline(file);
            break;
        case FileStage.LLAMA_MM:
            stage_instance = new LLAMAMMPipeline(file);
            break;
        case FileStage.ENTITIES:
            stage_instance = new EntitiesPipeline(file);
            break;
        case FileStage.MONTAGE:
            stage_instance = new MontagePipeline(file);
            break;
        case FileStage.FILENAME:
            stage_instance = new FilenamePipeline(file);
            break;
        case FileStage.MARKER_PDF:
            stage_instance = new MarkerPDFPipeline(file);
            break;
        case FileStage.MAMMOTH:
            stage_instance = new MammothPipeline(file);
            break;
        default:
            console.error(`No file workflow found for stage ${stage}`);
            file.status = FileStatus.ERROR;
            file.stage = stage;
            await updateFile(file);
            send_ws_message(file, 'No workflow found');
            return false;
    }
    if (!stage_instance) {
        console.error(`No file workflow found for stage ${stage}`);
        file.status = FileStatus.ERROR;
        file.stage = stage;
        await updateFile(file);
        send_ws_message(file, 'No workflow found');
        return false;
    }
    try {
        await stage_instance.process();
        await stage_instance.done();
        const end_time = Date.now();
        logger.info({ msg: `File ${file._id} stage ${stage} took ${end_time - start_time}ms`, file_id: file._id, tags: ['file', 'info'] });
        if (stage === FileStage.DONE) {
            file.status = FileStatus.ACTIVE;
            file.stage = FileStage.DONE;
            await updateFile(file);
            send_ws_message(file, `Pipeline complete`);
            logger.info({ msg: 'Pipeline complete', file_id: file._id, tags: ['file', 'info'] });
            await createAlert({
                user_id: file.user_id?.toString(),
                message: `Pipeline complete for ${file.original_name}`,
                type: 'info',
                seen: false
            });
        }
        // Broadcast success
        send_ws_message(file, `${stage} complete`);
    } catch (error: any) {
        logger.error({ msg: 'Error processing file', error: error, file_id: file._id, tags: ['file', 'error'] });
        // Change file status to error
        if (!file._id) {
            logger.error({ msg: 'File ID is undefined', file_id: file._id, tags: ['file', 'error'] });
        } else {
            const errfile = await getFile(file._id);
            if (errfile) {
                errfile.status = FileStatus.ERROR;
                errfile.stage = stage;
                await updateFile(errfile);
                send_ws_message(errfile, error.message);
                await createAlert({
                    user_id: errfile.user_id?.toString(),
                    message: `Error processing ${errfile.original_name} at stage ${stage}: ${error.message}`,
                    type: 'error',
                    seen: false
                });
            }
        }
    }
    return true;
}

async function checkStalledFiles() {
    logger.info({ msg: 'Checking for stalled files...', tags: ['file', 'info'] });
    const stalledFiles = await FileModel.find({
        status: FileStatus.PROCESSING,
        stage: { $ne: FileStage.DONE }
    });

    logger.info({ msg: `Found ${stalledFiles.length} stalled files`, tags: ['file', 'info'] });
    
    for (const file of stalledFiles) {
        logger.info({ msg: `Restarting stalled file ${file._id} at stage ${file.stage}`, file_id: file._id, tags: ['file', 'info'] });
        file.status = FileStatus.PENDING;
        await updateFile(file);
        send_ws_message(file, `Restarting stalled pipeline at stage ${file.stage}`);
        await handleFile(file);
    }
}

async function main() {
    if (!process.env.MONGO_URL) {
        throw new Error("Environment variable MONGO_URL not set");
    }
    await connectDB(process.env.MONGO_URL);
    
    // Check for stalled files on startup
    await checkStalledFiles();
    
    // Connect to WebSocket server and wait for connection
    try {
        for (const stage of stages) {
            new SourcerySub((file: SourceryFile) => handleFile(file), `file-${stage}`);
        }
    } catch (error) {
        logger.error({ msg: 'Failed to connect to WebSocket server', error: error, tags: ['file', 'error'] });
        process.exit(1);
    }
}

main();
