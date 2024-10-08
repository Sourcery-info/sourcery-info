import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { PDFiumLibrary } from '@hyzyla/pdfium';

export class OCRPipeline extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        const pdfium = await PDFiumLibrary.init();
        const doc = await this.file.read();
        const collection = this.file.project;
        const filename = this.file.filename;
        console.log(`OCRing file: ${filename} in collection: ${collection}`);
        const buff = await this.file.readBuffer();
        const document = await pdfium.loadDocument(buff);
        let i = 0;
        for (const page of document.pages()) {
            console.log(`${i + 1} - rendering...`);
            // Render PDF page to PNG image
            const image = await page({
            scale: 3, // 3x scale (91 DPI is the default)
            render: 'sharp', // use "sharp" for converting bitmap to PNG
            });

            // Save the PNG image to the output folder
            await fs.writeFile(`output/${i + 1}.png`, image.data);
        }
        pdfium.destroy();
        return this.file;
    }
}