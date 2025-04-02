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

/** @type {import('./$types').PageServerLoad} */
import { getProject } from '$lib/classes/projects'
import { fail } from '@sveltejs/kit';
import { updateConversation, getConversation } from '$lib/classes/conversations';

export async function load({ locals, params }: { locals: any, params: any }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const project_id = params.project_id;
    const project = await getProject(project_id);
    if (!project?._id) {
        return fail(404, { message: 'Project not found' });
    }
    const conversation = await getConversation(params.conversation_id);
    conversation.messages = conversation.messages?.map(message => {
        return {
            ...message,
            chunk_ids: message.chunk_ids?.map(chunk_id => chunk_id.toString()),
            file_ids: message.file_ids?.map(file_id => file_id.toString())
        };
    });
    if (!conversation?._id) {
        return fail(404, { message: 'Conversation not found' });
    }
    return {
        project,
        conversation
    };
};

export const actions = {
    message_complete: async ({ request, params }: { request: any, params: any }) => {
        const { conversation_id } = params;
        const { message } = await request.json();
        const conversation = await getConversation(conversation_id);
        if (!conversation?._id) {
            return fail(404, { message: 'Conversation not found' });
        }
        if (!conversation.messages) {
            conversation.messages = [];
        }
        await updateConversation({ 
            ...conversation,
            messages: [...conversation.messages, message] 
        });
    }
}