import { getChunk, getChunksByParent } from "$lib/classes/chunks";
import { getFile } from "$lib/classes/files";
import { getEntitiesByChunk } from "$lib/classes/entities";
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const { project_id, chunk_id } = params;
    const chunk = await getChunk(chunk_id);
    
    if (!chunk) {
        return { chunk: null };
    }

    const entities = await getEntitiesByChunk(chunk_id);

    const [file, children] = await Promise.all([
        chunk.file_id ? getFile(chunk.file_id) : null,
        getChunksByParent(chunk_id)
    ]);

    let parent = null;
    if (chunk.parent) {
        parent = await getChunk(chunk.parent);
    }

    return { 
        chunk,
        file,
        parent,
        children,
        entities,
        project_id
    };
};
