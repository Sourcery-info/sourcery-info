import { PipelineBase } from "./base"
import { Ollama } from "ollama";
import path from "path";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import { setTimeout } from "timers/promises";
import { isValidImage } from "@sourcery/common/src/utils";
import { retry } from "@sourcery/common/src/retry";
const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});
import { ensure_model } from "@sourcery/common/src/ollama";

const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "30") * 1000; // Convert to milliseconds
const OLLAMA_RETRIES = parseInt(process.env.OLLAMA_RETRIES || "3");

export class LLAMAMMPipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "json", "json");
        console.log("LLAMAMM Pipeline constructor");
    }

    async process() {
        try {
            await ensure_model("llama3.2-vision");
            const images = LLAMAMMPipeline.stage_paths.images.files;

            // Continue with existing individual image processing
            let x = 0;
            let pages = [];
            const easyocr_file = path.join(this.filepath, "easyocr", `${this.file.filename}.json`);
            const easyocr_data = await fs.readFile(easyocr_file, "utf-8");
            const easyocr_data_json = JSON.parse(easyocr_data);
            console.log(easyocr_data_json);
            for (const image of images) {
                console.time(`Ollama processed ${image}`);
                const imagePath = path.join(this.filepath, "images", image);
                const output_file = path.join(this.filepath, "json", `${this.file.filename}.${x++}.json`);
                const easyocr_page = easyocr_data_json[x];
                
                
                console.log(`Processing ${image} - Output file: ${output_file}`);
                // Test if it is a valid image file
                
                if (!(await isValidImage(imagePath))) {
                    console.error(`Invalid or unsupported image file: ${image}`);
                    continue;
                }
                const img_data = await fs.readFile(imagePath);
                if (!img_data) {
                    console.error(`No image data for ${image}`);
                    continue;
                }
                const img_base64 = await retry(() => ollama.encodeImage(img_data), {
                    identifier: `encode_image_${image}`
                });
                let content = "";
                // if (pages.length > 0) {
                //     content = `OCR this image. Return the text in Markdown format. Here is the previous pages content for context: <previous_pages>${pages.join("\n\n")}</previous_pages>`;
                // } else {
                    content = `OCR this document page. 
OCR all the text in the page. Do not skip any text. Go right to the bottom of the page.
If there is an image, describe it in detail. 
If there is a table, return the table in CSV format.
If there is a chart or diagram, describe it in detail and extract the data in CSV format.
If there is a page number or page number range, return it as a string.
Do not hallucinate. Describe only the text and data that you see. If there is nothing there, return an empty string.
If there is text, return the text accurately and faithfully in markdown format.

Return JSON with the following fields:
- image_description: description of the image
- table_csv: CSV representation of the table
- chart_description: description of the chart
- chart_data_csv: CSV representation of the chart data
- diagram_description: description of the diagram
- page_number: page number or page number range
- markdown: Markdown-formatted text from the page, split into an array of paragraphs.

Example JSON:
{
    "image_description": ["...", "..."],
    "table_csv": ["...", "..."],
    "chart_description": ["...", "..."],
    "page_number": ["...", "..."],
    "markdown": ["...", "..."]
}

Here is an easyocr version of the page:
<easyocr_page>${easyocr_page}</easyocr_page>
`;
    //         content = `Analyze the text in the provided image. Extract all readable content and present it in a structured Markdown format that is clear, concise, and well-organized. Ensure proper formatting (e.g., headings, lists, or code blocks) as necessary to represent the content effectively.

    // Return JSON with the following fields:
    // - markdown: Markdown-formatted text from the page
    // `
                // }
                const messages = [
                    {
                        role: 'user',
                        content,
                        images: [img_base64]
                    }
                ]
                
                const response = await retry(async () => {
                    const timeoutPromise = setTimeout(OLLAMA_TIMEOUT, 'timeout');
                    return await Promise.race([
                        ollama.generate({
                            model: 'llama3.2-vision',
                            prompt: content,
                            images: [img_base64],
                            format: 'json',
                            options: {
                                temperature: 0.0,
                            }
                        }),
                        timeoutPromise.then(() => {
                            ollama.abort();
                            throw new Error('Ollama request timed out');
                        })
                    ]);
                }, {
                    identifier: `process_image_${image}`,
                    maxRetries: OLLAMA_RETRIES
                });

                // Check if the response is valid JSON
                const json_response = JSON.parse(response.response);
                if (json_response.error) {
                    throw new Error(`Ollama returned an error: ${json_response.error}`);
                }
                pages.push(json_response);
                // Write the description to a file
                await fs.writeFile(output_file, JSON.stringify(json_response, null, 2));
                console.timeEnd(`Ollama processed ${image}`);
            }
            
            const output_text = JSON.stringify(pages, null, 2);
            await fs.writeFile(path.join(this.filepath, "json", `${this.file.filename}.json`), output_text);
        } catch (error) {
            console.error(`Error processing ${this.file.filename}`);
            console.error(error);
            throw error;
        }
        return this.file;
    }
}