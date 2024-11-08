import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { PDFiumLibrary } from '@hyzyla/pdfium';
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class OCRPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file);
    }
    
    async process() {
        console.log("OCR Pipeline");
        const result = await fetch(`http://sourcery-ocr:3000/ocr`, {
            method: 'POST',
            body: JSON.stringify({
                project: this.file.project,
                filename: this.file.filename
            })
        });
        const data = await result.json();
        console.log(data);
        return this.file;
    }
}