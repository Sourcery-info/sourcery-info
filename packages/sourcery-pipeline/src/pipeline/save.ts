import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile, writeFile } from "fs/promises";
import { ChunkingPipeline } from "./chunk";
import path from "path";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import { ChunkModel } from "@sourcery/common/src/models/Chunk.model";
import { FileModel } from "@sourcery/common/src/models/File.model";

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
        const local_chunks: any[] = [...chunks].map(chunk => {
            const children = chunk.children?.map(child => child.id);
            return { ...chunk, children };
        });
        const local_file = { filename: file.filename, original_name: file.original_name, filetype: file.filetype, created_at: file.created_at, updated_at: file.updated_at, file_id: file._id };
        for (const chunk of local_chunks) {
            points.push({
                id: chunk.id,
                vectors: chunk.vector,
                data: { ...chunk, ...local_file },
            });
        }
        await this.client.addRecords(collection, points);
    }

    async save_to_mongo(chunks: TChunk[], file: SourceryFile) {
        // Upsert based on chunk id
        const file_id = await FileModel.findOne({ filename: file.filename });
        for (const chunk of chunks) {
            try {
                const local_chunk = {
                    file_id: file_id?._id,
                    parent: chunk.parent ? await ChunkModel.findOne({ id: chunk.parent }) : null,
                    id: chunk.id,
                    title: chunk.title,
                    level: chunk.level,
                    content: chunk.content,
                    context: chunk.context,
                    tokens: chunk.tokens,
                    created_at: chunk.created_at,
                    updated_at: chunk.updated_at,
                }
                await ChunkModel.updateOne({ id: chunk.id }, { $set: local_chunk }, { upsert: true });
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
        // Update children
        for (const chunk of chunks) {
            if (chunk.children && chunk.children.length > 0) {
                const children = await ChunkModel.find({ id: { $in: chunk.children.map(child => child.id) } });
                await ChunkModel.updateOne({ id: chunk.id }, { $set: { children: children.map(child => child._id) } });
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
