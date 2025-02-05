import { PipelineBase } from "./base";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import path from "path";
import { Ollama } from "ollama";
import { ensure_model } from "@sourcery/common/src/ollama";
import { setTimeout } from "timers/promises";
import { retry } from "@sourcery/common/src/retry";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "120") * 1000;
const OLLAMA_RETRIES = parseInt(process.env.OLLAMA_RETRIES || "3");
const MODEL = process.env.OLLAMA_FILENAME_MODEL || "llama3.2-vision";

interface FilenameResult {
    timestamp: string;
    source: string;
    suggestedFilename: string;
    humanFriendlyName: string;
    summary: string;
    confidence: number;
    reasoning: string;
}

export class FilenamePipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json", "filename");
    }

    private async suggestFilename(imagePath: string): Promise<FilenameResult> {
        const img_data = await fs.readFile(imagePath);
        if (!img_data) {
            throw new Error(`No image data for ${imagePath}`);
        }
        const img_base64 = await retry(() => ollama.encodeImage(img_data), {
            identifier: `encode_image_${path.basename(imagePath)}`
        });

        const prompt = `Look at this image and suggest a filename for the document it represents.

Return a JSON object with:
- suggestedFilename: machine-friendly filename (lowercase, hyphens, no special chars)
- humanFriendlyName: natural, readable title (can include spaces and proper capitalization)
- summary: a brief 1-2 sentence summary of what you see in the image
- confidence: how confident you are in this suggestion (number between 0 and 1)
- reasoning: brief explanation of why these names were chosen

The machine-friendly filename should:
- Be lowercase
- Use hyphens instead of spaces
- Be concise but descriptive
- Not include special characters except hyphens

Example response:
{
    "suggestedFilename": "getting-started-guide",
    "humanFriendlyName": "Getting Started Guide",
    "summary": "A comprehensive guide for new users explaining initial setup and basic usage of the platform.",
    "confidence": 0.9,
    "reasoning": "Content is clearly an introduction guide for new users"
}
`;

        const response = await retry(async () => {
            const timeoutPromise = setTimeout(OLLAMA_TIMEOUT, 'timeout');
            return await Promise.race([
                ollama.chat({
                    model: MODEL,
                    messages: [{
                        role: 'user',
                        content: prompt,
                        images: [img_base64]
                    }],
                    format: "json",
                    options: {
                        temperature: 0.1,
                    }
                }),
                timeoutPromise.then(() => {
                    ollama.abort();
                    throw new Error('Ollama request timed out');
                })
            ]);
        }, {
            identifier: `filename_suggestion_${path.basename(imagePath)}`,
            maxRetries: OLLAMA_RETRIES
        });

        try {
            const result = JSON.parse(response.message.content);
            if (!result.suggestedFilename || !result.humanFriendlyName || 
                !result.summary || !result.confidence || !result.reasoning) {
                throw new Error('Invalid response format');
            }
            return {
                timestamp: new Date().toISOString(),
                source: path.basename(imagePath),
                ...result
            };
        } catch (parseError) {
            console.warn('Failed to parse JSON response:', response.message.content);
            throw parseError;
        }
    }

    async process() {
        try {
            await ensure_model(MODEL);
            const images = FilenamePipeline.stage_paths.images.files;
            
            // We only process the first image
            if (images.length > 0) {
                const image = images[0];
                console.time(`Processing filename suggestion for ${image}`);
                const inputPath = path.join(this.filepath, "images", image);
                const outputPath = path.join(this.filepath, "filename", `${this.file.filename}.json`);
                
                // Get filename suggestion based on the image
                const result = await this.suggestFilename(inputPath);
                
                // Ensure the filename directory exists
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                
                // Write the result to a JSON file
                await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
                console.timeEnd(`Processing filename suggestion for ${image}`);
            }
            
            return this.file;
        } catch (error) {
            console.error(`Error processing filename for ${this.file.filename}`);
            console.error(error);
            throw error;
        }
    }
} 