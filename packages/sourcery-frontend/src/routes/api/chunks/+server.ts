import { json } from '@sveltejs/kit';
import { ChunkModel } from '@sourcery/common/src/models/Chunk.model';
import mongoose from 'mongoose';

export async function GET({ url }) {
    const ids = url.searchParams.get('ids');
    if (!ids) {
        return json({ error: 'No chunk IDs provided' }, { status: 400 });
    }

    const chunkIds = ids.split(',').map(id => new mongoose.Types.ObjectId(id));
    const chunks = await ChunkModel.find({ _id: { $in: chunkIds } });

    return json(chunks.map(chunk => ({
        _id: chunk._id.toString(),
        id: chunk.id?.toString(),
        file_id: chunk.file_id?.toString(),
        title: chunk.title,
        level: chunk.level,
        content: chunk.content,
        parent: chunk.parent?.toString() || null,
        children: chunk.children || null,
        context: chunk.context,
        tokens: chunk.tokens,
        created_at: chunk.created_at,
        updated_at: chunk.updated_at
    })));
} 