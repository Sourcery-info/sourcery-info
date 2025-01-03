import { EntityModel } from '@sourcery/common/src/models/Entity.model';
import type { Entity } from '@sourcery/common/types/Entities.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
import mongoose from 'mongoose';
const pub = new SourceryPub(`sourcery.info-ws`);

async function pubEntity(entity: Entity): Promise<void> {
    if (!entity._id) {
        return;
    }
    const entity_db = await getEntity(entity._id);
    pub.addJob(`${entity_db.project_id}:entity`, { entity: entity_db });
}

function mapDBEntity(entity: Entity): Entity {
    return {
        _id: entity._id?.toString(),
        id: entity.id?.toString(),
        project_id: entity.project_id?.toString(),
        type: entity.type,
        value: entity.value,
        description: entity.description,
        aliases: entity.aliases,
        chunk_ids: [entity.chunk_ids[0]?.toString()],
        created_at: entity.created_at,
        updated_at: entity.updated_at
    }
}

export async function getEntities(project_id: string): Promise<Entity[]> {
    const entities = await EntityModel.find({ project_id: project_id }).sort({ updated_at: -1 });
    console.log(entities);
    return entities.map(mapDBEntity);
}

export async function getEntity(entity_id: string): Promise<Entity> {
    const entity = await EntityModel.findById(entity_id);
    if (!entity) {
        throw new Error('Entity not found');
    }
    return mapDBEntity(entity);
}

export async function createEntity(entity: Entity): Promise<Entity> {
    const { _id, ...entityData } = entity;
    if (entityData.project_id) {
        entityData.project_id = new mongoose.Types.ObjectId(entityData.project_id);
    }
    if (entityData.chunk_ids?.[0]) {
        entityData.chunk_ids = [new mongoose.Types.ObjectId(entityData.chunk_ids[0])];
    }
    const newEntity = await EntityModel.create(entityData);
    console.log(newEntity);
    pubEntity(newEntity);
    return mapDBEntity(newEntity);
}

export async function updateEntity(entity: Entity): Promise<Entity> {
    const { _id, ...updateData } = entity;
    if (updateData.project_id) {
        updateData.project_id = new mongoose.Types.ObjectId(updateData.project_id);
    }
    if (updateData.chunk_ids?.[0]) {
        updateData.chunk_ids = [new mongoose.Types.ObjectId(updateData.chunk_ids[0])];
    }
    const updatedEntity = await EntityModel.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedEntity) {
        throw new Error('Entity not found');
    }
    pubEntity(updatedEntity);
    return mapDBEntity(updatedEntity);
}

export async function deleteEntity(entity_id: string): Promise<void> {
    const deletedEntity = await EntityModel.findByIdAndDelete(entity_id);
    if (!deletedEntity) {
        throw new Error('Entity not found');
    }
    pubEntity(deletedEntity);
}

export async function getEntitiesByType(project_id: string, type: string): Promise<Entity[]> {
    const entities = await EntityModel.find({ 
        project_id: new mongoose.Types.ObjectId(project_id), 
        type 
    }).sort({ value: 1 });
    return entities.map(mapDBEntity);
}

export async function getEntitiesByChunk(chunk_id: string): Promise<Entity[]> {
    const entities = await EntityModel.find({ 
        chunk_ids: new mongoose.Types.ObjectId(chunk_id) 
    }).sort({ type: 1, value: 1 });
    return entities.map(mapDBEntity);
}
