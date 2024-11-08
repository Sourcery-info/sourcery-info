import { PipelineBase } from "./base"
import type { FileTypes, SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { FileStage } from "@sourcery/common/types/SourceryFile.type";
import { updateFile } from "@sourcery/frontend/src/lib/classes/files";
import { fileTypeWorkflows } from "../file_workflows";

export class UnprocessedPipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "unprocessed");
    }

    async process(): Promise<SourceryFile> {
        if (!this.file.filetype) {
            throw new Error("File type is required");
        }
        const workflow = fileTypeWorkflows[this.file.filetype as FileTypes] || fileTypeWorkflows.default;
        this.file.stage_queue = workflow.stages as FileStage[];
        this.file.stage = "unprocessed";
        this.file.last_filename = this.file.filename;
        await updateFile(this.file);
        return this.file;
    }
}