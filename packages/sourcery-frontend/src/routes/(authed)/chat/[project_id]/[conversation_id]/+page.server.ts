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
    console.log(`conversation: ${conversation?._id}`);
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