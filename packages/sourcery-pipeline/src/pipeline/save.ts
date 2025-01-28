import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile, writeFile } from "fs/promises";
import { ChunkingPipeline } from "./chunk";
import path from "path";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import { ChunkModel } from "@sourcery/common/src/models/Chunk.model";
import { FileModel } from "@sourcery/common/src/models/File.model";
import { EntityModel } from "@sourcery/common/src/models/Entity.model";
import { Entity } from "@sourcery/common/types/Entities.type";
export class SavePipeline extends PipelineBase {
    private client: Qdrant;

    constructor(file: SourceryFile) {
        super(file, "json");
        this.client = new Qdrant({ url: process.env.QDRANT_URL || "http://localhost:6333", });
    }

    async delete_existing_file() {
        const collection = this.file.project;
        await this.client.deleteFile(collection.toString(), this.file.filename);
    }

    async save_to_qdrant(collection: string, chunks: TChunk[], file: SourceryFile) {
        await this.client.createCollection(collection);
        await this.client.deleteFile(collection.toString(), this.file.filename);
        const local_chunks: any[] = [...chunks].map(chunk => {
            const children = chunk.children?.map(child => child.id);
            return { ...chunk, children };
        });
        // const local_file = { filename: file.filename, original_name: file.original_name, filetype: file.filetype, created_at: file.created_at, updated_at: file.updated_at, file_id: file._id };
        let x = 0;
        let points: any[] = [];
        for (const chunk of [...chunks]) {
            const chunk_data = {
                id: chunk.id,
                vector: chunk.vector,
                children: chunk.children?.map(child => child.id),
                created_at: file.created_at,
                updated_at: file.updated_at,
                level: chunk.level,
                tokens: chunk.tokens,
                filetype: file.filetype,
                file_id: file._id,
            }
            points.push({
                id: chunk.id,
                vectors: chunk.vector,
                data: chunk_data,
            });
            x++;
            if (x % 100 === 0) {
                await this.client.addRecords(collection, points);
                points = [];
                console.log(`${Math.round(x / [...chunks].length * 100)}%`);
            }
            if (x === [...chunks].length) {
                await this.client.addRecords(collection, points);
            }
        }
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

    async save_to_entities(entities: Entity[], file: SourceryFile) {
        const chunks = await ChunkModel.find({ file_id: file._id });
        for (const entity of entities) {
            const matching_chunks = chunks.filter(chunk => entity.chunk_ids.includes(chunk.id));
            if (matching_chunks.length === 0) {
                continue;
            }
            const entity_data = {
                project_id: file.project,
                type: entity.type,
                value: entity.value,
                description: entity.description,
                chunk_ids: matching_chunks.map(chunk => chunk._id)
            }
            await EntityModel.updateOne({ project_id: file.project, type: entity.type, value: entity.value }, { $set: entity_data }, { upsert: true });
        }
    }
    
    async process() {
        const collection = this.file.project;
        const chunkFile = SavePipeline.stage_paths.vectorising.files[0];
        const inputPath = path.join(this.filepath, "vectorising", chunkFile);
        const data = await readFile(inputPath, "utf8");
        const root: TChunk = JSON.parse(data);
        const chunks = ChunkingPipeline.flattenChunks(root);
        const entityFile = SavePipeline.stage_paths.entities.files[0];
        const entityPath = path.join(this.filepath, "entities", entityFile);
        const entities = await readFile(entityPath, "utf8");
        const entities_data = JSON.parse(entities);
        await Promise.all([
            this.save_to_qdrant(collection.toString(), chunks, this.file),
            this.save_to_mongo(chunks, this.file),
        ]);
        await this.save_to_entities(entities_data, this.file);
        return this.file;
    }
}
// 6777e4d72635e0d9a998fe62