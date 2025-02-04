import { Qdrant } from "@sourcery/sourcery-db/src/qdrant";
import { PipelineBase } from "./base"
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type.ts"
import { readFile } from "fs/promises";
import { ChunkingPipeline } from "./chunk";
import path from "path";
import type { TChunk } from "@sourcery/common/types/Chunks.type";
import { ChunkModel } from "@sourcery/common/src/models/Chunk.model";
import { FileModel } from "@sourcery/common/src/models/File.model";
import { Entity } from "@sourcery/common/types/Entities.type";
import { AIModels } from "@sourcery/common/src/ai-models";
import { ProjectModel } from "@sourcery/common/src/models/Project.model";
import { upsertEntity } from "@sourcery/frontend/src/lib/classes/entities";

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
        // Get the project's vector model and dimensions
        const project = await ProjectModel.findById(file.project);
        const vectorModel = project?.vector_model || AIModels.find(model => model.type === 'embed' && model.default)?.value;
        const dimensions = AIModels.find(model => model.value === vectorModel)?.dimensions || 768;

        await this.client.createCollection(collection, dimensions);
        await this.client.deleteFile(collection.toString(), this.file.filename);
        const local_chunks: any[] = [...chunks].map(chunk => {
            const children = chunk.children?.map(child => child.id);
            return { ...chunk, children };
        });
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

    async save_entities_to_qdrant(collection: string, entities: Entity[], file: SourceryFile) {
        try {
            console.log(`Starting save_entities_to_qdrant for file ${file.filename}`);
            console.log(`Found ${entities.length} entities to process`);

            // Get the project's vector model and dimensions
            const project = await ProjectModel.findById(file.project);
            console.log(`Using project ${project?._id}, vector model: ${project?.vector_model}`);
            
            const vectorModel = project?.vector_model || AIModels.find(model => model.type === 'embed' && model.default)?.value;
            const dimensions = AIModels.find(model => model.value === vectorModel)?.dimensions || 768;
            console.log(`Vector dimensions: ${dimensions}`);

            // Create entities collection if it doesn't exist
            const entities_collection = `${collection}_entities`;
            console.log(`Creating/ensuring collection ${entities_collection}`);
            try {
                await this.client.createCollection(entities_collection, dimensions);
            } catch (err) {
                console.error('Error creating collection:', err);
                throw err;
            }
            
            // Delete existing entities for this file
            console.log(`Deleting existing entities for file ${this.file.filename}`);
            try {
                await this.client.deleteFile(entities_collection, this.file.filename);
            } catch (err) {
                console.error('Error deleting existing entities:', err);
                // Don't throw here, continue with insert
            }

            let x = 0;
            let points: any[] = [];
            let skipped = 0;
            for (const entity of entities) {
                try {
                    if (!entity.vector) {
                        console.warn(`Entity ${entity.value} (${entity.type}) has no vector, skipping`);
                        skipped++;
                        continue;
                    }

                    if (!entity.id || !entity._id) {
                        console.warn(`Entity ${entity.value} missing id or _id, skipping`);
                        skipped++;
                        continue;
                    }

                    const entity_data = {
                        _id: entity._id,
                        id: entity.id,
                        type: entity.type,
                        value: entity.value,
                        description: entity.description,
                        file_id: file._id,
                        project_id: file.project.toString(),
                        created_at: entity.created_at || file.created_at,
                        updated_at: entity.updated_at || file.updated_at,
                    }

                    console.log(`Processing entity ${entity.id}: ${entity.type} - ${entity.value}`);
                    
                    points.push({
                        id: entity.id,  // Use UUID for Qdrant
                        vectors: entity.vector,
                        data: entity_data,
                    });

                    x++;
                    if (x % 100 === 0) {
                        console.log(`Saving batch of ${points.length} entities`);
                        try {
                            await this.client.addRecords(entities_collection, points);
                            console.log(`Successfully saved batch to Qdrant`);
                        } catch (err) {
                            console.error('Error saving batch to Qdrant:', err);
                            throw err;
                        }
                        points = [];
                        console.log(`Saved ${Math.round(x / entities.length * 100)}% of entities to Qdrant`);
                    }
                } catch (err) {
                    console.error(`Error processing entity ${entity.value}:`, err);
                    throw err;
                }
            }

            if (points.length > 0) {
                console.log(`Saving final batch of ${points.length} entities`);
                try {
                    console.log(points);
                    await this.client.addRecords(entities_collection, points);
                    console.log(`Successfully saved final batch to Qdrant`);
                } catch (err) {
                    console.error('Error saving final batch to Qdrant:', err);
                    throw err;
                }
            }

            console.log(`Completed save_entities_to_qdrant: Processed ${x} entities, skipped ${skipped} entities`);
        } catch (err) {
            console.error('Error in save_entities_to_qdrant:', err);
            throw err;
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
        try {
            console.log(`Starting save_to_entities for file ${file.filename}`);
            console.log(`Found ${entities.length} entities to process`);
            
            const chunks = await ChunkModel.find({ file_id: file._id });
            console.log(`Found ${chunks.length} chunks for file`);

            let saved = 0;
            let skipped = 0;
            for (const entity of entities) {
                try {
                    const matching_chunks = chunks.filter(chunk => entity.chunk_ids.includes(chunk.id));
                    if (matching_chunks.length === 0) {
                        console.warn(`No matching chunks found for entity ${entity.value}, skipping`);
                        skipped++;
                        continue;
                    }

                    console.log(`Processing entity: ${entity.type} - ${entity.value}`);
                    console.log(`Found ${matching_chunks.length} matching chunks`);

                    const entity_data = {
                        project_id: file.project.toString(),
                        type: entity.type,
                        value: entity.value,
                        description: entity.description,
                        vector: entity.vector,
                        chunk_ids: matching_chunks.map(chunk => chunk._id)
                    }
                    await upsertEntity(entity_data);
                    saved++;
                } catch (err) {
                    console.error(`Error processing entity ${entity.value}:`, err);
                    throw err;
                }
            }
            console.log(`Completed save_to_entities: Saved ${saved} entities, skipped ${skipped} entities`);
        } catch (err) {
            console.error('Error in save_to_entities:', err);
            throw err;
        }
    }
    
    async process() {
        try {
            console.log('Starting SavePipeline process');
            const collection = this.file.project;
            
            // Read chunks
            console.log('Reading chunks file');
            const chunkFile = SavePipeline.stage_paths.vectorising.files[0];
            const inputPath = path.join(this.filepath, "vectorising", chunkFile);
            const data = await readFile(inputPath, "utf8");
            const root: TChunk = JSON.parse(data);
            const chunks = ChunkingPipeline.flattenChunks(root);
            console.log(`Found ${chunks.length} chunks to process`);

            // Read entities
            console.log('Reading entities file');
            const entityFile = SavePipeline.stage_paths.entities.files[0];
            const entityPath = path.join(this.filepath, "entities", entityFile);
            const entities = await readFile(entityPath, "utf8");
            const entities_data = JSON.parse(entities);
            console.log(`Found ${entities_data.length} entities to process`);

            // Save everything in parallel
            console.log('Starting parallel save operations');
            await Promise.all([
                this.save_to_qdrant(collection.toString(), chunks, this.file)
                    .catch(err => {
                        console.error('Error in save_to_qdrant:', err);
                        throw err;
                    }),
                this.save_entities_to_qdrant(collection.toString(), entities_data, this.file)
                    .catch(err => {
                        console.error('Error in save_entities_to_qdrant:', err);
                        throw err;
                    }),
                this.save_to_mongo(chunks, this.file)
                    .catch(err => {
                        console.error('Error in save_to_mongo:', err);
                        throw err;
                    }),
                this.save_to_entities(entities_data, this.file)
                    .catch(err => {
                        console.error('Error in save_to_entities:', err);
                        throw err;
                    }),
            ]);

            console.log('Successfully completed all save operations');
            return this.file;
        } catch (err) {
            console.error('Error in SavePipeline process:', err);
            throw err;
        }
    }
}
// 6777e4d72635e0d9a998fe62