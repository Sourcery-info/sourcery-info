import { searchEntities } from '$lib/classes/entities';
import { searchFiles } from '$lib/classes/files';
import { searchConversations } from '$lib/classes/conversations';

/** @type {import('./$types').RequestHandler} */
export async function POST({request}) {
    const { query, project_id } = await request.json();

    const [entities, files, conversations] = await Promise.all([
        searchEntities(project_id, query),
        searchFiles(project_id, query),
        searchConversations(project_id, query)
    ]);

    return new Response(JSON.stringify({
        entities: entities.map((entity) => ({
            id: entity._id,
            name: entity.value,
            type: entity.type,
            description: entity.description || ''
        })),
        files: files.map((file) => ({
            id: file._id,
            name: file.original_name || file.filename,
            type: file.filetype,
            metadata: file.metadata || ''
        })),
        conversations: conversations.map((conversation) => ({
            id: conversation._id,
            name: conversation.title,
            preview: conversation.preview || ''
        }))
    }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
