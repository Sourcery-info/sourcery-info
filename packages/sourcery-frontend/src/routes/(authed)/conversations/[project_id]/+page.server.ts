import type { PageServerLoad } from './$types';
import { getConversations } from '$lib/classes/conversations';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = params.project_id;
    const conversations = (await getConversations(projectId)).map(conversation => {
        delete conversation.messages;
        return conversation;
    });
    return {
        conversations,
        project_id: projectId
    };
}; 