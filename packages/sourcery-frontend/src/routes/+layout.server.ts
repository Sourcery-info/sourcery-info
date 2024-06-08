/** @type {import('./$types').PageServerLoad} */

import Projects from '$lib/classes/projects';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import { error } from '@sveltejs/kit';
import { getManifest } from '@sourcery/common/src/manifest.js';

type response = {
    // projects: ProjectType[],
    project: ProjectType | null
}

export async function load({ params }): Promise<response> {
    const projects = new Projects();
    let proj_data = projects.get();
    let response: response = {
        // projects: proj_data,
        project: null
    }
    if (params?.project) {
        response.project = proj_data.find(p => p.urlid === params.project) || null;
        if (response.project === null) {
            return error(404, 'Project not found');
        }
        response.project.files = getManifest(params.project);
    }
    return response;
};