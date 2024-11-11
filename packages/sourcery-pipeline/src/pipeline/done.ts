import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class DonePipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json");
    }
}