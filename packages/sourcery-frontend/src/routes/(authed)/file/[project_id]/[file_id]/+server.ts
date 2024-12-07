/** @type {import('./$types').RequestHandler} */
import { deleteFile as deleteFileUtils } from '$lib/utils/files';
import { Qdrant } from '@sourcery/sourcery-db/src/qdrant';
import { error } from '@sveltejs/kit';
import { deleteFile } from '$lib/classes/files';

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