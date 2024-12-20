import { PipelineBase } from "./base"
import * as fs from 'node:fs';
import { Ollama } from "ollama";
import { writeFile } from "node:fs/promises";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import path from "node:path";
import { ChunkingPipeline } from "./chunk";
import { ensure_model } from "@sourcery/common/src/ollama";

const model = "llama3.2:latest";

export class ContextualChunkPipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "json", "chunks");
    }
    
    async process() {
        console.log("Processing contextual chunking");
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        await ensure_model(model);
        const doc_file = ContextualChunkPipeline.stage_paths.md.files[0];
        const doc_text = fs.readFileSync(path.join(this.filepath, "md", doc_file), 'utf8');
        const chunks_file = ContextualChunkPipeline.stage_paths.chunks.files[0];
        const chunks_text = fs.readFileSync(path.join(this.filepath, "chunks", chunks_file), 'utf8');
        const root: TChunk = JSON.parse(chunks_text);

        // Get all chunks as a flat array
        const allChunks = ChunkingPipeline.flattenChunks(root);
        
        // Process each chunk
        for (let i = 0; i < allChunks.length; i++) {
            console.log(`Processing chunk ${i + 1} of ${allChunks.length}`);
            const chunk = allChunks[i];
            const prompt = `
<document>
${doc_text}
</document>

Here is the chunk we want to situate within the whole document
<chunk>
${chunk.content}
</chunk>

Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk.
Answer only with the succinct context and nothing else.`;

            const response = await ollama.generate({
                model: model,
                prompt: prompt,
                stream: false
            });

            // Add the contextual information to the chunk
            chunk.context = response.response;
            console.log(`Processed chunk ${i + 1} of ${allChunks.length}`);
        }

        await writeFile(this.filename, JSON.stringify(root, null, 2));
        return this.file;
    }
} 