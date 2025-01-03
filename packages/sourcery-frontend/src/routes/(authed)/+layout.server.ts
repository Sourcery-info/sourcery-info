/** @type {import('./$types').LayoutServerLoad} */

import { getProject, getProjects } from '$lib/classes/projects';
import { getConversations } from '$lib/classes/conversations';
import { getFiles } from '$lib/classes/files';
import { getEntities } from '$lib/classes/entities';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
import type { Entity as EntityType } from '@sourcery/common/types/Entities.type.ts';
import { error } from '@sveltejs/kit';
import type { SourceryFile } from '$lib/types/SourceryFile.type';
import { ORIGIN } from '$env/static/private';

type response = {
    project: ProjectType | null,
    projects: ProjectType[] | null,
    conversations: ConversationType[] | null,
    entities: EntityType[] | null,
    // session: any,
    // user: any
    origin: string;
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
        entities: [],
        // session: locals.session,
        // user: locals.user
        origin: ORIGIN
    }
    if (params?.project_id) {
        response.project = await getProject(params.project_id);
        if (response.project) {
            const files = await getFiles(params.project_id);
            response.project.files = files as unknown as SourceryFile[];
            response.conversations = (await getConversations(params.project_id)).map(conversation => {
                delete conversation.messages;
                return conversation;
            });
            response.entities = await getEntities(params.project_id);
            console.log(response.entities);
        }
    }
    return response;
};
