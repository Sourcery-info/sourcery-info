/** @type {import('./$types').RequestHandler} */
import { deleteFile as deleteFileUtils } from '$lib/utils/files';
import { getFile, updateFile } from '$lib/classes/files';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { deleteFile } from '$lib/classes/files';
import type { SourceryFile } from '@sourcery/common/types/SourceryFile.type';

const qdrant = new Qdrant({url: process.env.QDRANT_URL || "http://localhost:6333",});

export async function DELETE({ params }) {
    const { project_id, file_id } = params;
    try {
        await deleteFile(file_id);
        await deleteFileUtils(project_id, file_id);
        await qdrant.deleteCollection(file_id);
    } catch (err) {
        console.error('Error deleting file:', err);
        throw error(500, 'Failed to delete file');
    }
    return new Response();
};

export async function PUT({ params, request, locals }) {
    const allowed_params = ['status'] as const;
    const { file_id } = params;
    const file = await getFile(file_id);
    if (!file) {
        throw error(404, 'File not found');
    }
    
    // Check if the current user is the file owner
    if (file.user_id !== locals.user?.user_id) {
        throw error(403, 'Unauthorized: Only file owners can modify file status');
    }

    const body = await request.json() as Partial<SourceryFile>;
    for (const param of allowed_params) {
        if (body[param]) {
            (file as any)[param] = body[param];
        }
    }
    await updateFile(file);
    return new Response();
};