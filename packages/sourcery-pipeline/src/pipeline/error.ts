import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class ErrorPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file);
    }
    
    async process() {
        console.log(`File ${this.file._id} has started stage error`);
        return this.file;
    }

    async log_error(error: any) {
        console.error(error);
    }
}