import { SourcerySub } from "@sourcery/queue/src/sub";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { Validate } from "./pipeline/validate";
import { ExtractText } from "./pipeline/extract_text";
import { Chunk } from "./pipeline/chunk";
import { Vectorize } from "./pipeline/vectorize";
import { OCRPipeline } from "./pipeline/ocr";
import { Save } from "./pipeline/save";
import { DonePipeline } from "./pipeline/done";
import { LlamaIndexPipeline } from "./pipeline/llamaindex";
import { UnprocessedPipeline } from "./pipeline/unprocessed";
    import { ErrorPipeline } from "./pipeline/error";
import { connectDB } from '@sourcery/frontend/src/lib/server/db';
import { stages } from "./file_workflows";
import dotenv from "dotenv";
dotenv.config();

async function handleFile(file: SourceryFile, stage: string) {
    let stage_instance = null;
    switch (stage) {
        case "unprocessed":
            stage_instance = new UnprocessedPipeline(file);
            break;
        case "validating":
            stage_instance = new Validate(file);
            break;
        case "ocr":
            stage_instance = new OCRPipeline(file);
            break;
        case "text_extraction":
            stage_instance = new ExtractText(file);
            break;
        case "chunking":
            stage_instance = new Chunk(file);
            break;
        case "vectorizing":
            stage_instance = new Vectorize(file);
            break;
        case "saving":
            stage_instance = new Save(file);
            break;
        case "done":
            stage_instance = new DonePipeline(file);
            break;
        case "error":
            stage_instance = new ErrorPipeline(file);
            break;
        default:
            console.error(`No file workflow found for stage ${stage}`);
            return false;
    }
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
        new SourcerySub((file: SourceryFile) => handleFile(file, stage), `file-${stage}`);
    }
}

main();
