import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class DoclingPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "md");
        console.log("Docling Pipeline constructor");
    }
    
    async process() {
        try {
            const result = await execCommand(`/app/sourcery-ocr-env/bin/docling --to=md ${this.last_filename} --output ${path.join(this.filepath, this.stage_name)}`);
            console.log(result);
        } catch (error) {
            console.error(error);
            throw error;
        }
        return this.file;
    }
} 