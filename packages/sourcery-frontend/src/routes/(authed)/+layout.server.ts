/** @type {import('./$types').LayoutServerLoad} */

import Projects from '$lib/classes/projects';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { error } from '@sveltejs/kit';
import { getManifest } from '@sourcery/common/src/manifest.js';
import type { SourceryFile } from '$lib/types/SourceryFile.type';

type response = {
    // projects: ProjectType[],
    project: ProjectType | null,
    session: any
}

export async function load({ params, locals }): Promise<response> {
    const projects = new Projects();
    let proj_data = projects.get();
    let response: response = {
        // projects: proj_data,
        project: null,
        session: locals.session
    }
    if (params?.project) {
        response.project = proj_data.find(p => p.urlid === params.project) || null;
        if (response.project === null) {
            return error(404, 'Project not found');
        }
        response.project.files = getManifest(params.project) as unknown as SourceryFile[];
    }
    return response;
};
