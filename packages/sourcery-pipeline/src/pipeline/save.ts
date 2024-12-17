import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile, writeFile } from "fs/promises";
import { ChunkingPipeline } from "./chunk";
import path from "path";
import type { TChunk } from "@sourcery/common/types/Chunks.type";

export class SavePipeline extends PipelineBase {
    private client: Qdrant;

    constructor(file: SourceryFile) {
        super(file, "json");
        this.client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
    }
    
    async process() {
        const collection = this.file.project;
        await this.client.createCollection(collection);
        const chunkFile = SavePipeline.stage_paths.vectorising.files[0];
        const inputPath = path.join(this.filepath, "vectorising", chunkFile);
        const data = await readFile(inputPath, "utf8");
        const root: TChunk = JSON.parse(data);
        const chunks = ChunkingPipeline.flattenChunks(root);
        let points: any[] = [];
        for (const chunk of chunks) {
            const point = {
                id: chunk.id,
                vectors: chunk.vector,
                data: {
                    chunk_id: chunk.id,
                    title: chunk.title,
                    level: chunk.level,
                    content: chunk.content,
                    parent_id: chunk.parent,
                    ...this.file
                }
            }
            points.push(point);
        }
        const result = await this.client.addRecords(collection, points);
        return this.file;
    }
}