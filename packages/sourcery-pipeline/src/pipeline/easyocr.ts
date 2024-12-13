import { PipelineBase } from "./base"
import path from "path";
import fs from "fs/promises";
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { isValidImage } from "@sourcery/common/src/utils";

export class EasyOCRPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "json");
        console.log("EasyOCR Pipeline constructor");
    }
    
    async process() {
        try {
            const images = EasyOCRPipeline.stage_paths.images.files;
            let x = 0;
            for (const image of images) {
                console.log(`Processing ${image}`);
                const imagePath = path.join(this.filepath, "images", image);
                if (!(await isValidImage(imagePath))) {
                    console.error(`Invalid or unsupported image file: ${image}`);
                    continue;
                }
                // const cmd = `/app/sourcery-ocr-env/bin/easyocr -l en -f ${path.join(this.filepath, this.stage_name, "images", image)} > ${path.join(this.filepath, this.stage_name, "results", image)}`;
                const cmd = `/app/sourcery-ocr-env/bin/easyocr --paragraph True --output_format json -l en -f ${imagePath}  --model_storage_directory /app/packages/sourcery-frontend/assets/easyocr/ > ${path.join(this.filepath, "easyocr", this.file.filename)}.${x++}.jsonp`;
                console.log(cmd);
                const result = await execCommand(cmd);
                console.log(result);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
        const files = await fs.readdir(path.join(this.filepath, "easyocr"));
        let pages = [];
        let x = 0;
        for (const file of files) {
            try {
                const raw = await fs.readFile(path.join(this.filepath, "easyocr", file), "utf-8");
                const data = raw.split("\n").filter(line => line.trim() !== "").map(line => JSON.parse(line));
                pages.push({
                    page: x++,
                    filename: file,
                    data: data
                });
            } catch (error) {
                console.error(error);
            }
        }
        console.log(pages);
        await fs.writeFile(path.join(this.filepath, "easyocr", `${this.file.filename}.json`), JSON.stringify(pages, null, 2));
        return this.file;
    }
}