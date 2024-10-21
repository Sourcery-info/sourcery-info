import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { PDFiumLibrary } from '@hyzyla/pdfium';

export class OCRPipeline extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        await fetch(`http://sourcery-ocr:3000/ocr`, {
            method: 'POST',
            body: JSON.stringify({
                project: this.file.project,
                filename: this.file.filename
            })
        });
        
        return this.file;
    }
}