import { PipelineBase } from "./base"
import * as fs from 'node:fs';
import { Ollama } from "ollama";
import { writeFile } from "node:fs/promises";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import path from "node:path";
import { ChunkingPipeline } from "./chunk";
import { ensure_model } from "@sourcery/common/src/ollama";

const model = "nomic-embed-text:latest";

export class VectorizePipeline extends PipelineBase {

    constructor(file: SourceryFile) {
        super(file, "json");
    }
    
    async process() {
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        await ensure_model(model);
        const chunks_file = VectorizePipeline.stage_paths.chunks.files[0];
        const chunks_text = fs.readFileSync(path.join(this.filepath, "chunks", chunks_file), 'utf8');
        const root: TChunk = JSON.parse(chunks_text);

        // Get all chunks as a flat array
        const allChunks = ChunkingPipeline.flattenChunks(root);
        
        // Process each chunk
        for (let i = 0; i < allChunks.length; i++) {
            const chunk = allChunks[i];
            const embeddingRequest = {
                prompt: chunk.content,
                model: "nomic-embed-text:latest",
            };
            const vector = await ollama.embeddings(embeddingRequest);
            chunk.vector = vector.embedding;
            console.log(`Processed chunk ${i + 1} of ${allChunks.length}`);
        }

        await writeFile(this.filename, JSON.stringify(root, null, 2));
        return this.file;
    }
}