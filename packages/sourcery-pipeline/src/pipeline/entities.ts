import { PipelineBase } from "./base";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import path from "path";
import { Ollama } from "ollama";
import { ensure_model } from "@sourcery/common/src/ollama";
import { ChunkingPipeline } from "./chunk";
import { TChunk } from "@sourcery/common/types/Chunks.type";
import { Entity } from "@sourcery/common/types/Entities.type";
import { writeFile } from "node:fs/promises";

const MODEL = process.env.OLLAMA_ENTITIES_MODEL || "llama3.2";

export class EntitiesPipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json", "entities");
    }

    private async extractEntities(chunk: TChunk): Promise<Entity[]> {
        let response: Response | null = null;
        try {
            response = await fetch(`http://sourcery-ner:8000/ner`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: chunk.content })
        });
        } catch (error) {
            console.error(`Error extracting entities for ${chunk.content}`);
            if (response) {
                console.error(await response.text());
            }
            console.error(error);
            throw error;
        }
        const data = await response.json();
        if (!data.entities) {
            console.error(`No entities found for ${chunk.content}`);
            return [];
        }
        return this.consolidateEntities(data.entities.map((entity: any) => ({
            type: entity.label,
            value: entity.text,
            chunk_ids: [chunk.id],
            start: entity.start,
            end: entity.end
        })));
    }

    async consolidateEntities(entities: Entity[]): Promise<Entity[]> {
        // First pass - consolidate entities with the same value
        const consolidated_entities_1: Entity[] = [];
        for (const entity of entities) {
            // If no type or value, skip
            if (!entity.type || !entity.value || !entity.chunk_ids) {
                continue;
            }
            const existing: any = consolidated_entities_1.find(e => e.value.toLowerCase() === entity.value.toLowerCase() && e.type === entity.type);
            if (existing) {
                existing.chunk_ids = Array.from(new Set([...existing.chunk_ids, ...entity.chunk_ids]));
                continue;
            }
            consolidated_entities_1.push(entity);
        }
        // console.log({consolidated_entities_1});
        // Second pass - consolidate PERSON entities with only first name into a single entity with the full name
        const consolidated_entities_2: Entity[] = [];
        for (const entity of consolidated_entities_1) {
            if (entity.type === "PERSON" && entity.value.split(" ").length === 1) {
                const exists: any = consolidated_entities_1.find(e => {
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
                    exists.chunk_ids = Array.from(new Set([...exists.chunk_ids, ...entity.chunk_ids]));
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

    private chunkMap = (chunks: TChunk[]) => {
        return chunks.map(chunk => `Chunk content: ${chunk.content}\nChunk context: ${chunk.context}`).join('\n\n');
    }

    private async generateDescription(entity: Entity, chunks: TChunk[]): Promise<string> {
        const entity_chunks = chunks.filter(chunk => chunk.entities?.some(e => e.value === entity.value && e.type === entity.type));
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        const prompt = `The following is a set of chunks that include information about the named entity ${entity.value}, which is of type ${entity.type}. Generate a brief biography or description for ${entity.value} using the following chunks based on what you know about ${entity.value}. Describe the NAMED ENTITY, not the chunks. This description should be no more than 100 words.\n\n<CHUNKS>\n${this.chunkMap(entity_chunks.slice(0, 10))}</CHUNKS>\n\nRespond in JSON format with the following keys: "name", "type", "description".\n\nThe description should be something like "John Doe is a software engineer who works at Google."`;
        const response = await ollama.generate({
            model: MODEL,
            prompt,
            format: "json",
            options: {
                temperature: 0.1,
            }
        });
        const result = JSON.parse(response.response);
        return result.description;
    }

    async process() {
        try {
            const chunks_file = EntitiesPipeline.stage_paths.chunks.files[0];
            const chunks_filename = path.join((this.filepath), "chunks", chunks_file);
            const chunks_text = await fs.readFile(chunks_filename, 'utf8');
            const root: TChunk = JSON.parse(chunks_text);
            const allChunks = ChunkingPipeline.flattenChunks(root);
            const entities: Entity[] = [];
            let chunk_count = 0;
            let entity_chunks: TChunk[] = [];
            for (const chunk of allChunks) {
                chunk_count++;
                if (chunk.children && chunk.children.length > 0) {
                    continue;
                }
                // Extract entities using Ollama
                const extracted_entities = await this.extractEntities(chunk);
                entities.push(...extracted_entities);
                chunk.entities = extracted_entities;
                entity_chunks.push(chunk);
                console.log(`Processed chunk ${chunk_count} of ${allChunks.length}`);
            }
            await writeFile(chunks_filename, JSON.stringify(root, null, 2));
            const consolidated_entities = await this.consolidateEntities(entities);
            await ensure_model(MODEL);
            for (const entity of consolidated_entities) {
                entity.description = await this.generateDescription(entity, entity_chunks);
            }
            // console.log(consolidated_entities);
            // console.log(`Writing ${consolidated_entities.length} entities to ${this.filename.replace("chunks", "entities")}`);
            await writeFile(this.filename, JSON.stringify(consolidated_entities, null, 2));
            return this.file;
        } catch (error) {
            console.error(`Error processing entities for ${this.file.filename}`);
            console.error(error);
            throw error;
        }
    }
} 