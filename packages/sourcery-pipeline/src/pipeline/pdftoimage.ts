import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { execCommand } from "../execCommand";
import path from "path";

export class PDFToImagePipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, 'png', 'images');
        console.log("PDFToImage Pipeline constructor");
    }
    
    async process() {
        console.log("PDFToImage Pipeline Process");
        console.log(`pdftocairo -png ${this.last_filename} ${path.join(this.filepath, this.directory_name, this.file.filename)}`);
        await execCommand(`pdftocairo -png ${this.last_filename} ${path.join(this.filepath, this.directory_name, this.file.filename)}`);
        return this.file;
    }
}