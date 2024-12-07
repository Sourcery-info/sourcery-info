import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import path from "path";
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

export class EasyOCRPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "md");
        console.log("EasyOCR Pipeline constructor");
    }
    
    async process() {
        try {
            const images = EasyOCRPipeline.stage_paths.images.files;
            let x = 0;
            for (const image of images) {
                console.log(`Processing ${image}`);
                // const cmd = `/app/sourcery-ocr-env/bin/easyocr -l en -f ${path.join(this.filepath, this.stage_name, "images", image)} > ${path.join(this.filepath, this.stage_name, "results", image)}`;
                const cmd = `/app/sourcery-ocr-env/bin/easyocr -l en -f ${path.join(this.filepath, "images", image)} --model_storage_directory /app/packages/sourcery-frontend/assets/easyocr/ > ${path.join(this.filepath, "easyocr", this.file.filename)}.${x++}.txt`;
                console.log(cmd);
                const result = await execCommand(cmd);
                console.log(result);
            }
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