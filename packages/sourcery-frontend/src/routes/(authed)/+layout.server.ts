/** @type {import('./$types').LayoutServerLoad} */

import { getProject, getProjects } from '$lib/classes/projects';
import { getConversations } from '$lib/classes/conversations';
import { getFiles } from '$lib/classes/files';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
import { error } from '@sveltejs/kit';
import type { SourceryFile } from '$lib/types/SourceryFile.type';

type response = {
    project: ProjectType | null,
    projects: ProjectType[] | null,
    conversations: ConversationType[] | null,
    // session: any,
    // user: any
}

export async function load({ params, locals }): Promise<response> {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    const projects = await getProjects(locals?.session?.user_id);
    let response: response = {
        project: null,
        projects: projects,
        conversations: [],
        // session: locals.session,
        // user: locals.user
    }
    if (params?.project_id) {
        response.project = await getProject(params.project_id);
        if (response.project) {
            response.project.files = await getFiles(params.project_id) as unknown as SourceryFile[];
            response.conversations = (await getConversations(params.project_id)).map(conversation => {
                delete conversation.messages;
                return conversation;
            });
        }
    }
    // console.log(response);
    return response;
};
