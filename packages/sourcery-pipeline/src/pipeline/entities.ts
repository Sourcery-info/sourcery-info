import { PipelineBase } from "./base";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import fs from "fs/promises";
import path from "path";

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
        const response = await fetch(`http://sourcery-ner:8000/ner`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: chunk.content })
        });
        const data = await response.json();
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
                const extracted_entities = await this.extractEntities(chunk);
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