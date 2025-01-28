import { PipelineBase } from "./base"
import path from "path";
import fs from "fs/promises";
import { execCommand } from "../execCommand";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import { isValidImage } from "@sourcery/common/src/utils";
import { logger } from "@sourcery/common/src/logger";

export class EasyOCRPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "json");
    }
    
    async process() {
        try {
            const images = EasyOCRPipeline.stage_paths.images.files;
            let x = 0;
            for (const image of images) {
                const imagePath = path.join(this.filepath, "images", image);
                if (!(await isValidImage(imagePath))) {
                    logger.error({ msg: `Invalid or unsupported image file: ${image}`, file_id: this.file._id, tags: ['file', 'error'] });
                    continue;
                }
                // const cmd = `/app/sourcery-ocr-env/bin/easyocr -l en -f ${path.join(this.filepath, this.stage_name, "images", image)} > ${path.join(this.filepath, this.stage_name, "results", image)}`;
                const cmd = `/app/sourcery-ocr-env/bin/easyocr --paragraph True --output_format json -l en -f ${imagePath}  --model_storage_directory /app/packages/sourcery-frontend/assets/easyocr/ > ${path.join(this.filepath, "easyocr", this.file.filename)}.${x++}.jsonp`;
                const result = await execCommand(cmd);
                logger.info({ msg: `EasyOCR result: ${result}`, file_id: this.file._id, tags: ['file', 'info'] });
            }
        } catch (error) {
            logger.error({ msg: `Error processing EasyOCR`, error: error, file_id: this.file._id, tags: ['file', 'error'] });
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
                logger.error({ msg: `Error processing EasyOCR`, error: error, file_id: this.file._id, tags: ['file', 'error'] });
            }
        }
        await fs.writeFile(path.join(this.filepath, "easyocr", `${this.file.filename}.json`), JSON.stringify(pages, null, 2));
        return this.file;
    }
}