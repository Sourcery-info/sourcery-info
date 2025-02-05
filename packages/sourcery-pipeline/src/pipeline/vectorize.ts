import { PipelineBase } from "./base"
import * as fs from 'node:fs';
import { Ollama } from "ollama";
import { writeFile } from "node:fs/promises";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import type { Entity } from "@sourcery/common/types/Entities.type";
import path from "node:path";
import { ChunkingPipeline } from "./chunk";
import { ensure_model } from "@sourcery/common/src/ollama";
import { getProject } from "@sourcery/frontend/src/lib/classes/projects";
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import { retry } from "@sourcery/common/src/retry";

export class VectorizeChunksPipeline extends PipelineBase {
    private vector_model: string;

    constructor(file: SourceryFile) {
        super(file, "json", "vectorising");
        this.vector_model = "nomic-embed-text:latest"; // Default model
    }
    
    async process() {
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        
        // Get project settings and update vector model if configured
        const project = await getProject(this.file.project.toString());
        if (project?.vector_model) {
            this.vector_model = project.vector_model;
        }
        
        await ensure_model(this.vector_model);
        const chunks_file = VectorizeChunksPipeline.stage_paths.chunks.files[0];
        const chunks_text = fs.readFileSync(path.join(this.filepath, "chunks", chunks_file), 'utf8');
        const root: TChunk = JSON.parse(chunks_text);

        // Get all chunks as a flat array
        const allChunks = ChunkingPipeline.flattenChunks(root);
        
        // Process each chunk
        for (let i = 0; i < allChunks.length; i++) {
            const chunk = allChunks[i];
            let prompt = chunk.content;
            if (chunk.context) {
                prompt = `${chunk.context}\n\n${prompt}`;
            }
            const embeddingRequest = {
                prompt: prompt,
                model: this.vector_model,
                keep_alive: 1,
            };
            const vector = await retry(() => ollama.embeddings(embeddingRequest), {
                identifier: `chunk_embedding_${i}`
            });
            chunk.vector = vector.embedding;
            console.log(`Processed chunk ${i + 1} of ${allChunks.length}`);
        }

        await writeFile(this.filename, JSON.stringify(root, null, 2));
        return this.file;
    }
}

export class VectorizeEntitiesPipeline extends PipelineBase {
    private vector_model: string;

    constructor(file: SourceryFile) {
        super(file, "json", "entities");
        this.vector_model = "nomic-embed-text:latest"; // Default model
    }
    
    async process() {
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        
        // Get project settings and update vector model if configured
        const project = await getProject(this.file.project.toString());
        if (project?.vector_model) {
            this.vector_model = project.vector_model;
        }
        
        await ensure_model(this.vector_model);
        const entities_file = VectorizeEntitiesPipeline.stage_paths.entities.files[0];
        const entities_text = fs.readFileSync(path.join(this.filepath, "entities", entities_file), 'utf8');
        const entities: Entity[] = JSON.parse(entities_text);

        // Process each entity
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            
            // Ensure each entity has both _id and id
            if (!entity._id) {
                entity._id = new mongoose.Types.ObjectId().toString();
            }
            if (!entity.id) {
                entity.id = randomUUID();
            }
            
            // Combine entity information into a meaningful text for vectorization
            const prompt = `Value: ${entity.value}\nType: ${entity.type}\nDescription: ${entity.description}`;
            
            const embeddingRequest = {
                prompt: prompt,
                model: this.vector_model,
                keep_alive: 1,
            };
            const vector = await retry(() => ollama.embeddings(embeddingRequest), {
                identifier: `entity_embedding_${i}`
            });
            entity.vector = vector.embedding;
            console.log(`Processed entity ${i + 1} of ${entities.length}`);
        }

        await writeFile(this.filename, JSON.stringify(entities, null, 2));
        return this.file;
    }
}