import { PipelineBase } from "./base";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import path from "path";
import { Ollama } from "ollama";
import { ensure_model } from "@sourcery/common/src/ollama";
import { setTimeout } from "timers/promises";
import { ChunkingPipeline } from "./chunk";
import { TChunk } from "@sourcery/common/types/Chunks.type";
import { Entity } from "@sourcery/common/types/Entities.type";
import { writeFile } from "node:fs/promises";
const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "5") * 1000;
const OLLAMA_RETRIES = parseInt(process.env.OLLAMA_RETRIES || "3");
const MODEL = process.env.OLLAMA_ENTITIES_MODEL || "llama3.2";

export class EntitiesPipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json", "entities");
    }

    private async extractEntitiesDEPRECATED(content: string, context: string): Promise<Entity[]> {
        let retries = OLLAMA_RETRIES;
        
        const prompt = `Extract named entities from the following text and its context in the document. Possible entity types are: PERSON, ORGANIZATION, LOCATION, DATE, MONEY, EMAIL, ID, PHONE, URL. Include a brief description for each entity. If you do not find any entities, respond with an empty array. Respond in well-formed JSON.

<example>
[
    {
        "type": "PERSON",
        "value": "John Doe",
        "description": "The person who is the main character in the story."
    }
]
</example>

<document>
${content}
</document>

<context>
${context}
</context>`;
        // console.log(zodToJsonSchema(EntityListSchema));
        // console.log(prompt);
        while (retries > 0) {
            try {
                const timeoutPromise = setTimeout(OLLAMA_TIMEOUT, 'timeout');
                const response = await Promise.race([
                    ollama.generate({
                        model: MODEL,
                        prompt: prompt,
                        system: "You are an expert at extracting named entities (NER) from text. All output must be in valid JSON. Don’t add explanation beyond the JSON",
                        format: 'json',
                        options: {
                            temperature: 0,
                        },
                        stream: false
                    }),
                    timeoutPromise.then(() => {
                        ollama.abort();
                        throw new Error('Ollama request timed out');
                    })
                ]);

                try {
                    // console.log(response.response);
                    const entities = JSON.parse(response.response.trim());
                    // console.log(entities);
                    if (Array.isArray(entities.entities)) {
                        return entities.entities;
                    }
                    throw new Error('Response is not an array');
                } catch (parseError) {
                    console.warn('Failed to parse JSON response:', response.response);
                    throw parseError;
                }
            } catch (error: any) {
                retries--;
                if (retries === 0) {
                    // throw new Error(`Failed to extract entities after ${OLLAMA_RETRIES} attempts: ${error.message}`);
                    return [];
                }
                console.warn(`Attempt failed, ${retries} retries remaining. Error: ${error.message}`);
                await setTimeout(1000);
            }
        }
        
        return [];
    }

    private async extractEntities(content: string, context: string): Promise<Entity[]> {
        const response = await fetch(`http://sourcery-ner:8000/ner`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: content })
        });
        const data = await response.json();
        // console.log(data);
        return this.consolidateEntities(data.entities.map((entity: any) => ({
            type: entity.label,
            value: entity.text
        })));
    }

    async consolidateEntities(entities: Entity[]): Promise<Entity[]> {
        // First pass - consolidate entities with the same value
        const consolidated_entities_1: Entity[] = [];
        for (const entity of entities) {
            // If no type or value, skip
            if (!entity.type || !entity.value ) {
                continue;
            }
            const existing = consolidated_entities_1.find(e => e.value.toLowerCase() === entity.value.toLowerCase() && e.type === entity.type);
            if (existing) {
                continue;
            }
            consolidated_entities_1.push(entity);
        }
        // console.log({consolidated_entities_1});
        // Second pass - consolidate PERSON entities with only first name into a single entity with the full name
        const consolidated_entities_2: Entity[] = [];
        for (const entity of consolidated_entities_1) {
            if (entity.type === "PERSON" && entity.value.split(" ").length === 1) {
                const exists = consolidated_entities_1.find(e => {
                    if (e.type !== "PERSON") {
                        return false;
                    }
                    const parts = e.value.split(" ");
                    if (parts.length === 1) {
                        return false;
                    }
                    return parts[0].toLowerCase() === entity.value.toLowerCase()
                });
                if (exists) {
                    continue;
                }
            }
            consolidated_entities_2.push(entity);
        }
        // Remove pronouns
        const pronouns = ["i", "he", "she", "it", "they", "them", "their", "theirs", "themselves", "you", "your", "yours", "yourself", "yourselves", "we", "us", "our", "ours", "ourselves"];
        const consolidated_entities_3 = consolidated_entities_2.filter(e => !pronouns.includes(e.value.toLowerCase()));
        // console.log({consolidated_entities_3});
        return consolidated_entities_3;
    }

    async process() {
        try {
            await ensure_model(MODEL);
            const chunks_file = EntitiesPipeline.stage_paths.chunks.files[0];
            const chunks_filename = path.join((this.filepath), "chunks", chunks_file);
            const chunks_text = await fs.readFile(chunks_filename, 'utf8');
            const root: TChunk = JSON.parse(chunks_text);
            const allChunks = ChunkingPipeline.flattenChunks(root);
            const entities: Entity[] = [];
            let chunk_count = 0;
            for (const chunk of allChunks) {
                chunk_count++;
                if (chunk.children && chunk.children.length > 0) {
                    continue;
                }
                // Extract entities using Ollama
                const extracted_entities = await this.extractEntities(chunk.content, chunk.context || "");
                entities.push(...extracted_entities);
                chunk.entities = extracted_entities;
                console.log(`Processed chunk ${chunk_count} of ${allChunks.length}`);
            }
            await writeFile(chunks_filename, JSON.stringify(root, null, 2));
            const consolidated_entities = await this.consolidateEntities(entities);
            // console.log(consolidated_entities);
            console.log(`Writing ${consolidated_entities.length} entities to ${this.filename.replace("chunks", "entities")}`);
            await writeFile(this.filename, JSON.stringify(consolidated_entities, null, 2));
            return this.file;
        } catch (error) {
            console.error(`Error processing entities for ${this.file.filename}`);
            console.error(error);
            throw error;
        }
    }
} 