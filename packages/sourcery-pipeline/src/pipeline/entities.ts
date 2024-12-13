import { PipelineBase } from "./base";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import path from "path";
import { Ollama } from "ollama";
import { ensure_model } from "@sourcery/common/src/ollama";
import { setTimeout } from "timers/promises";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "120") * 1000;
const OLLAMA_RETRIES = parseInt(process.env.OLLAMA_RETRIES || "3");
const MODEL = process.env.OLLAMA_ENTITIES_MODEL || "llama3.2";

interface Entity {
    type: string;
    value: string;
    context?: string;
    confidence?: number;
}

export class EntitiesPipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json", "entities");
        console.log("Entities Pipeline constructor");
    }

    private async extractEntities(content: string): Promise<Entity[]> {
        let retries = OLLAMA_RETRIES;
        
        const prompt = `Extract named entities from the following text. Return only a JSON array of objects with 'type' and 'value' properties. Entity types should include: PERSON, ORGANIZATION, LOCATION, DATE, MONEY, PERCENTAGE, EMAIL, PHONE, URL, and OTHER. Include a brief context string for each entity.

JSON example:
{
    "entities": [
        {
            "type": "PERSON",
            "value": "John Smith",
            "context": "mentioned as CEO"
        },
        {
            "type": "ORGANIZATION",
            "value": "Acme Corp",
            "context": "company discussed in document"
        }
    ]
}

Text to analyze:
${content}`;

        while (retries > 0) {
            try {
                const timeoutPromise = setTimeout(OLLAMA_TIMEOUT, 'timeout');
                const response = await Promise.race([
                    ollama.chat({
                        model: MODEL,
                        messages: [{
                            role: 'user',
                            content: prompt
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

                try {
                    const entities = JSON.parse(response.message.content);
                    console.log(entities);
                    if (Array.isArray(entities.entities)) {
                        return entities.entities;
                    }
                    throw new Error('Response is not an array');
                } catch (parseError) {
                    console.warn('Failed to parse JSON response:', response.message.content);
                    throw parseError;
                }
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    throw new Error(`Failed to extract entities after ${OLLAMA_RETRIES} attempts: ${error.message}`);
                }
                console.warn(`Attempt failed, ${retries} retries remaining. Error: ${error.message}`);
                await setTimeout(1000);
            }
        }
        
        return [];
    }

    async process() {
        try {
            await ensure_model(MODEL);
            const mdFiles = EntitiesPipeline.stage_paths.md.files;
            
            for (const mdFile of mdFiles) {
                console.time(`Processing entities for ${mdFile}`);
                const inputPath = path.join(this.filepath, "md", mdFile);
                const outputPath = path.join(this.filepath, "entities", mdFile.replace('.md', '.json'));
                
                // Read the markdown content
                const content = await fs.readFile(inputPath, 'utf-8');
                
                // Extract entities using Ollama
                const entities = await this.extractEntities(content);
                
                const result = {
                    timestamp: new Date().toISOString(),
                    source: mdFile,
                    entities: entities
                };
                
                // Ensure the entities directory exists
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                
                // Write the entities to a JSON file
                await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
                console.timeEnd(`Processing entities for ${mdFile}`);
            }
            
            return this.file;
        } catch (error) {
            console.error(`Error processing entities for ${this.file.filename}`);
            console.error(error);
            throw error;
        }
    }
} 