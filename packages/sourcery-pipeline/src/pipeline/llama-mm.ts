import { PipelineBase } from "./base"
import { Ollama } from "ollama";
import path from "path";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import { setTimeout } from "timers/promises";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});
import { ensure_model } from "@sourcery/common/src/ollama";

const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "120") * 1000; // Convert to milliseconds
const OLLAMA_RETRIES = parseInt(process.env.OLLAMA_RETRIES || "3");

export class LLAMAMMPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "md", "md");
        console.log("LLAMAMM Pipeline constructor");
    }

    async process() {
        try {
            await ensure_model("llama3.2-vision");
            const images = LLAMAMMPipeline.stage_paths.images.files;

            // Continue with existing individual image processing
            let x = 0;
            let pages = [];
            for (const image of images) {
                console.time(`Ollama processed ${image}`);
                const imagePath = path.join(this.filepath, "images", image);
                const output_file = path.join(this.filepath, "md", `${this.file.filename}.${x++}.md`);
                console.log(`Processing ${image} - Output file: ${output_file}`);
                // Test if it is a valid image file
                
                if (!(await this.isValidImage(imagePath))) {
                    console.error(`Invalid or unsupported image file: ${image}`);
                    continue;
                }
                const img_data = await fs.readFile(imagePath);
                if (!img_data) {
                    console.error(`No image data for ${image}`);
                    continue;
                }
                const img_base64 = await ollama.encodeImage(img_data);
                let content = "";
                // if (pages.length > 0) {
                //     content = `OCR this image. Return the text in Markdown format. Here is the previous pages content for context: <previous_pages>${pages.join("\n\n")}</previous_pages>`;
                // } else {
                    content = `OCR this image. Return the text in Markdown format:`;
                // }
                const messages = [
                    {
                        role: 'user',
                        content,
                        images: [img_base64]
                    }
                ]
                let response;
                let retries = OLLAMA_RETRIES;
                
                while (retries > 0) {
                    try {
                        const timeoutPromise = setTimeout(OLLAMA_TIMEOUT, 'timeout');
                        response = await Promise.race([
                            ollama.chat({
                                model: 'llama3.2-vision',
                                messages,
                                options: {
                                    temperature: 0.0,
                                }
                            }),
                            timeoutPromise.then(() => {
                                ollama.abort();
                                throw new Error('Ollama request timed out');
                            })
                        ]);
                        break; // Success, exit retry loop
                    } catch (error: any) {
                        retries--;
                        if (retries === 0) {
                            throw new Error(`Failed to process image after ${OLLAMA_RETRIES} attempts: ${error.message}`);
                        }
                        console.warn(`Attempt failed, ${retries} retries remaining. Error: ${error.message}`);
                        await setTimeout(1000); // Wait 1 second before retrying
                    }
                }

                if (!response) { 
                    throw new Error(`No response from ollama for ${image}`);
                }
                pages.push(response.message.content);
                // Write the description to a file
                await fs.writeFile(output_file, response.message.content);
                console.timeEnd(`Ollama processed ${image}`);
            }
            
            const output_text = pages.map((page, i) => `# Page ${i + 1}\n${page}`).join("\n\n");
            await fs.writeFile(path.join(this.filepath, "md", `${this.file.filename}.md`), output_text);
        } catch (error) {
            console.error(`Error processing ${this.file.filename}`);
            console.error(error);
            throw error;
        }
        return this.file;
    }

    private async isValidImage(imagePath: string): Promise<boolean> {
        // Check file extension first
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(imagePath).toLowerCase();
        if (!validExtensions.includes(ext)) {
            return false;
        }

        try {
            // Read first few bytes to check magic numbers
            const fileHandle = await fs.open(imagePath);
            const buffer = Buffer.alloc(12);  // Allocate 12 bytes for all format checks
            await fileHandle.read(buffer, 0, 12);
            await fileHandle.close();
            
            // Check magic numbers for common image formats
            const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
            const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
            const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
            const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

            return isJPEG || isPNG || isGIF || isWEBP;
        } catch (error) {
            console.error(`Error reading file ${imagePath}:`, error);
            return false;
        }
    }
}