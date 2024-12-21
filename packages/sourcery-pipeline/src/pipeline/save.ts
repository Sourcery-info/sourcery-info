import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile, writeFile } from "fs/promises";
import { ChunkingPipeline } from "./chunk";
import path from "path";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import { ChunkModel } from "@sourcery/common/src/models/Chunk.model";

export class SavePipeline extends PipelineBase {
    private client: Qdrant;

    constructor(file: SourceryFile) {
        super(file, "json");
        this.client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
    }

    async delete_existing_file() {
        const collection = this.file.project;
        await this.client.deleteFile(collection, this.file.filename);
    }

    async save_to_qdrant(collection: string, chunks: TChunk[], file: SourceryFile) {
        await this.client.createCollection(collection);
        await this.client.deleteFile(collection, this.file.filename);
        const points: any[] = [];
        for (const chunk of chunks) {
            points.push({
                id: chunk.id,
                vectors: chunk.vector,
                data: chunk,
                ...file
            });
        }
        await this.client.addRecords(collection, points);
    }

    async save_to_mongo(chunks: TChunk[], file: SourceryFile) {
        // Upsert based on chunk id
        for (const chunk of chunks) {
            try {
                const parent = chunk.parent ? await ChunkModel.findOne({ id: chunk.parent }) : null;
                await ChunkModel.updateOne({ id: chunk.id }, { $set: { ...chunk, parent: parent?._id } }, { upsert: true });
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    }
    
    async process() {
        const collection = this.file.project;
        const chunkFile = SavePipeline.stage_paths.vectorising.files[0];
        const inputPath = path.join(this.filepath, "vectorising", chunkFile);
        const data = await readFile(inputPath, "utf8");
        const root: TChunk = JSON.parse(data);
        const chunks = ChunkingPipeline.flattenChunks(root);
        await Promise.all([
            this.save_to_qdrant(collection, chunks, this.file),
            this.save_to_mongo(chunks, this.file)
        ]);
        return this.file;
    }
}
