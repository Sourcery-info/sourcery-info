import { SourcerySub } from "@sourcery/queue/src/sub";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { Validate } from "./pipeline/validate";
import { ExtractText } from "./pipeline/extract_text";
import { Chunk } from "./pipeline/chunk";
import { Vectorize } from "./pipeline/vectorize";
import { DoclingPipeline } from "./pipeline/docling";
import { Save } from "./pipeline/save";
import { DonePipeline } from "./pipeline/done";
import { PDFToImagePipeline } from "./pipeline/pdftoimage";
import { EasyOCRPipeline } from "./pipeline/easyocr";
import { LlamaIndexPipeline } from "./pipeline/llamaindex";
import { UnprocessedPipeline } from "./pipeline/unprocessed";
import { ErrorPipeline } from "./pipeline/error";
import { connectDB } from '@sourcery/frontend/src/lib/server/db';
import { stages } from "./file_workflows";
import { FileStage } from "@sourcery/common/types/SourceryFile.type";
import dotenv from "dotenv";
import { LLAMAMMPipeline } from "./pipeline/llama-mm";
dotenv.config();

async function handleFile(file: SourceryFile) {
    let stage_instance = null;
    let stage = file.stage;
    if (!stage) {
        stage = FileStage.UNPROCESSED;
    }
    console.log(`Processing ${stage} Pipeline`);
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
            stage_instance = new Chunk(file);
            break;
        case FileStage.VECTORISING:
            stage_instance = new Vectorize(file);
            break;
        case FileStage.SAVING:
            stage_instance = new Save(file);
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
        default:
            console.error(`No file workflow found for stage ${stage}`);
            return false;
    }
    // console.log({ stage_instance });
    if (!stage_instance) {
        console.error(`No file workflow found for stage ${stage}`);
        return false;
    }
    try {
        console.log(`Processing ${stage} Pipeline`);
        await stage_instance.process();
        console.log(`Finished ${stage} Pipeline`);
        await stage_instance.done();
    } catch (error) {
        console.error(error);
    }
    return true;
}

async function main() {
    if (!process.env.MONGO_URL) {
        throw new Error("Environment variable MONGO_URL not set");
    }
    await connectDB(process.env.MONGO_URL);
    for (const stage of stages) {
        console.log(`Subscribing to ${stage} queue`);
        new SourcerySub((file: SourceryFile) => handleFile(file), `file-${stage}`);
    }
}

main();
