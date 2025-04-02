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

import { ChunkModel } from '@sourcery/common/src/models/Chunk.model';
import type { TChunk } from '@sourcery/common/types/Chunks.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
import mongoose from 'mongoose';

const pub = new SourceryPub(`sourcery.info-ws`);

async function pubChunk(chunk: TChunk): Promise<void> {
    if (!chunk._id) {
        return;
    }
    const chunk_db = await getChunk(chunk._id);
    if (!chunk_db) {
        return;
    }
    pub.addJob(`${chunk_db.file_id}:chunk`, { chunk: chunk_db });
}

function mapDBChunk(chunk: TChunk): TChunk {
    return {
        _id: chunk._id?.toString(),
        id: chunk.id?.toString(),
        file_id: chunk.file_id?.toString(),
        title: chunk.title,
        level: chunk.level,
        content: chunk.content,
        parent: chunk.parent?.toString() || null,
        children: null,
        context: chunk.context,
        tokens: chunk.tokens,
        created_at: chunk.created_at,
        updated_at: chunk.updated_at
    }
}

export async function getChunks(file_id: string): Promise<TChunk[]> {
    const chunks = await ChunkModel.find({ file_id: new mongoose.Types.ObjectId(file_id) })
        .sort({ level: 1, title: 1 });
    return chunks.map(mapDBChunk);
}

export async function getChunk(chunk_id: string | mongoose.Types.ObjectId): Promise<TChunk | null> {
    const chunk = await ChunkModel.findOne({ _id: new mongoose.Types.ObjectId(chunk_id) });
    if (!chunk) {
        return null;
    }
    return mapDBChunk(chunk);
}

export async function getChunkByQdrantID(qdrant_id: string): Promise<TChunk | null> {
    const chunk = await ChunkModel.findOne({ id: qdrant_id }).populate('file_id');
    if (!chunk) {
        return null;
    }
    return mapDBChunk(chunk);
}

export async function getChunksByParent(parent_id: string): Promise<TChunk[]> {
    const chunks = await ChunkModel.find({ 
        parent: new mongoose.Types.ObjectId(parent_id) 
    }).sort({ level: 1, title: 1 });
    return chunks.map(mapDBChunk);
}

export async function getChunksByLevel(file_id: string, level: number): Promise<TChunk[]> {
    const chunks = await ChunkModel.find({ 
        file_id: new mongoose.Types.ObjectId(file_id),
        level: level
    }).sort({ title: 1 });
    return chunks.map(mapDBChunk);
}

export async function deleteChunk(chunk_id: string): Promise<void> {
    const chunk = await ChunkModel.findByIdAndDelete(chunk_id);
    if (!chunk) {
        return;
    }
    pub.addJob(`${chunk.file_id}:chunk-deleted`, { chunk: chunk });
}

export async function deleteChunksByFile(file_id: string): Promise<void> {
    const chunks = await ChunkModel.find({ file_id: new mongoose.Types.ObjectId(file_id) });
    if (!chunks) {
        return;
    }
    for (const chunk of chunks) {
        await deleteChunk(chunk._id);
        pub.addJob(`${chunk.file_id}:chunk-deleted`, { chunk: chunk });
    }
}
