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
