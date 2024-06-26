import { PipelineBase } from "./base"
import { File } from "@sourcery/common/src/file";
import * as fs from 'node:fs';
import { Ollama } from "ollama";

export class Vectorize extends PipelineBase {

    constructor(file: File) {
        super(file);
    }
    
    async process() {
        const ollama = new Ollama({ host: process.env.OLLAMA_URL || "http://localhost:11434" });
        const text = fs.readFileSync(this.file.filename, 'utf8');
        const chunks = JSON.parse(text);
        const result = [];
        let i = 0;
        for (const chunk of chunks) {
            const embeddingRequest = {
                prompt: chunk,
                model: "all-minilm",
            };
            const vector = await ollama.embeddings(embeddingRequest);
            result.push({
                id: new Date().getTime(),
                text: chunk,
                vectors: vector.embedding
            });
            console.log(`Processed chunk ${i++} of ${chunks.length}`)
        }
        this.file.write(JSON.stringify(result, null, 2));
        return this.file;
    }
}