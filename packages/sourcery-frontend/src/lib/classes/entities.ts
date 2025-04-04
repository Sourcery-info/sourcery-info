// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { EntityModel } from '@sourcery/common/src/models/Entity.model';
import type { Entity } from '@sourcery/common/types/Entities.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
import mongoose from 'mongoose';
import { getProject } from './projects';
const pub = new SourceryPub(`sourcery.info-ws`);

async function pubEntity(entity: Entity): Promise<void> {
    if (!entity._id) {
        return;
    }
    const entity_db = await getEntity(entity._id);
    if (!entity_db) {
        return;
    }
    const project = await getProject(entity_db.project_id.toString());
    if (!project) {
        return;
    }
    pub.addJob(`${project.owner}:entity`, { entity: entity_db });
}

function mapDBEntity(entity: Entity): Entity {
    const chunk_ids = entity.chunk_ids.map(chunk_id => chunk_id.toString());
    return {
        _id: entity._id?.toString(),
        id: entity.id?.toString(),
        project_id: entity.project_id?.toString(),
        type: entity.type,
        value: entity.value,
        description: entity.description,
        aliases: entity.aliases,
        chunk_ids: chunk_ids,
        created_at: entity.created_at,
        updated_at: entity.updated_at
    }
}

export async function getEntities(project_id: string): Promise<Entity[]> {
    const entities = await EntityModel.aggregate([
        { $match: { project_id: new mongoose.Types.ObjectId(project_id) } },
        { $unwind: '$chunk_ids' },
        { $lookup: { from: 'chunks', localField: 'chunk_ids', foreignField: '_id', as: 'chunk' } },
        { $unwind: '$chunk' },
        { 
            $group: {
                _id: '$_id',
                project_id: { $first: '$project_id' },
                type: { $first: '$type' },
                value: { $first: '$value' },
                description: { $first: '$description' },
                aliases: { $first: '$aliases' },
                chunk_ids: { $addToSet: '$chunk_ids' },
                file_ids: { $addToSet: '$chunk.file_id' },
                created_at: { $first: '$created_at' },
                updated_at: { $first: '$updated_at' }
            }
        },
        { $sort: { updated_at: -1 } }
    ]);

    entities.sort((a, b) => a.type.localeCompare(b.type) || a.value.localeCompare(b.value));
    entities.sort((a, b) => b.chunk_ids.length - a.chunk_ids.length);

    return entities.map(entity => ({
        ...mapDBEntity(entity),
        file_ids: entity.file_ids.map((id: mongoose.Types.ObjectId) => id.toString())
    }));
}

export async function getEntity(entity_id: string): Promise<Entity | null> {
    const entity = await EntityModel.findOne({ _id: new mongoose.Types.ObjectId(entity_id) });
    if (!entity) {
        return null;
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

export async function upsertEntity(entity: Entity): Promise<Entity> {
    const { _id, ...entityData } = entity;
    if (entityData.project_id) {
        entityData.project_id = new mongoose.Types.ObjectId(entityData.project_id);
    }
    const filter: any = {};
    if (_id) {
        filter._id = new mongoose.Types.ObjectId(_id);
    } else {
        filter.project_id = entityData.project_id;
        filter.type = entityData.type;
        filter.value = entityData.value;
    }
    if (entityData.chunk_ids?.[0]) {
        entityData.chunk_ids = [new mongoose.Types.ObjectId(entityData.chunk_ids[0])];
    }
    const upsertedEntity = await EntityModel.findOneAndUpdate(filter, entityData, { upsert: true, new: true });
    if (!upsertedEntity) {
        console.error('Error upserting entity', entity);
        throw new Error('Error upserting entity');
    }
    pubEntity(upsertedEntity);
    return mapDBEntity(upsertedEntity);
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

export async function getEntitiesByFile(project_id: string, file_id: string): Promise<Entity[]> {
    const entities = await EntityModel.aggregate([
        { $match: { project_id: new mongoose.Types.ObjectId(project_id) } },
        { $unwind: '$chunk_ids' },
        { $lookup: { from: 'chunks', localField: 'chunk_ids', foreignField: '_id', as: 'chunk' } },
        { $match: { 'chunk.file_id': new mongoose.Types.ObjectId(file_id) } },
        { 
            $group: {
                _id: '$_id',
                project_id: { $first: '$project_id' },
                type: { $first: '$type' },
                value: { $first: '$value' },
                description: { $first: '$description' },
                aliases: { $first: '$aliases' },
                chunk_ids: { $addToSet: '$chunk_ids' },
                created_at: { $first: '$created_at' },
                updated_at: { $first: '$updated_at' }
            }
        },
        { $addFields: { chunk_count: { $size: '$chunk_ids' } } },
        { $sort: { chunk_count: -1, type: 1, value: 1 } }
    ]);
    return entities.map(mapDBEntity);
}

export async function deleteEntitiesByFile(file_id: string): Promise<void> {
    const entities = await EntityModel.find({ file_ids: new mongoose.Types.ObjectId(file_id) });
    if (!entities) {
        throw new Error('Entities not found');
    }
    for (const entity of entities) {
        await EntityModel.findByIdAndDelete(entity._id);
        pub.addJob(`${entity.project_id}:entity-deleted`, { entity: entity });
    }
}

export async function searchEntities(project_id: string, query: string): Promise<Entity[]> {
    if (!query.trim()) {
        return [];
    }

    const entities = await EntityModel.find(
        {
            project_id: new mongoose.Types.ObjectId(project_id),
            $text: { $search: query }
        },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" }, type: 1, value: 1 })
    .limit(10);
    return entities.map(mapDBEntity);
}