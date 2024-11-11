import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { exec } from "child_process";
import path from "path";

export class PDFToImagePipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file);
        console.log("PDFToImage Pipeline constructor");
    }
    
    async process() {
        console.log("PDFToImage Pipeline Process");
        const output_dir = path.join(this.filepath, "images");
        console.log(`pdftocairo -png ${path.join(this.filepath, this.filename)} ${output_dir}`);
        // exec(`pdftocairo -png ${path.join(this.filepath, this.filename)} ${output_dir}`);
        return this.file;
    }
}