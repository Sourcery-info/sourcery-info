import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class OCRPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "md");
        console.log("OCR Pipeline constructor");
    }
    
    async process() {
        try {
            const result = await execCommand(`/app/sourcery-ocr-env/bin/docling --to=md ${this.last_filename} --output ${path.join(this.filepath, this.stage_name, this.file.filename)}.md`);
        } catch (error) {
            console.error(error);
            throw error;
        }
        // console.log(`pdftocairo ${this.last_filename} -png ${path.join(this.filepath, this.stage_name, "images")}`);
        // await exec(`pdftocairo ${this.last_filename} -png ${path.join(this.filepath, this.stage_name, "images")}`);
        // console.log(`/app/sourcery-ocr-env/bin/easyocr ${path.join(this.filepath, this.stage_name, "images")} ${path.join(this.filepath, this.stage_name, "results")}`);
        // await exec(`/app/sourcery-ocr-env/bin/easyocr -l en ${path.join(this.filepath, this.stage_name, "images")} ${path.join(this.filepath, this.stage_name, "results")}`);
        // const result = await fetch(`http://sourcery-ocr:3000/ocr`, {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         project: this.file.project,
        //         filename: this.file.filename
        //     })
        // });
        // const data = await result.json();
        // console.log(data);
        return this.file;
    }
}