/** @type {import('./$types').LayoutServerLoad} */

import Projects from '$lib/classes/projects';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { error } from '@sveltejs/kit';
import { getManifest } from '@sourcery/common/src/manifest.js';
import type { SourceryFile } from '$lib/types/SourceryFile.type';

type response = {
    project: ProjectType | null,
    // session: any,
    // user: any
}

export async function load({ params, locals }): Promise<response> {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    const projects = new Projects(locals?.session?.user_id);
    const proj_data = await projects.load_projects();
    let response: response = {
        project: null,
        // session: locals.session,
        // user: locals.user
    }
    if (params?.project) {
        const foundProject = proj_data.find(p => p.urlid === params.project);
        response.project = foundProject ? {
            ...foundProject,
            owner: locals.session.user_id,
            updated_at: foundProject.created_at,
            vector_model: 'default',
            chat_model: 'default',
            tags: [],
            security: 'public',
        } : null;
        if (response.project === null) {
            return error(404, 'Project not found');
        }
        response.project.files = getManifest(params.project) as unknown as SourceryFile[];
    }
    return response;
};
