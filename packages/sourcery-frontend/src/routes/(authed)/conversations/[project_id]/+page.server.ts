import type { PageServerLoad } from './$types';
import { getConversations } from '$lib/classes/conversations';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = params.project_id;
    const conversations = await getConversations(projectId);
    
    return {
        conversations,
        project_id: projectId
    };
}; 