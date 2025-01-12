import { getProject } from '$lib/classes/projects';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    try {
        const project = await getProject(params.project_id);
        if (!project) {
            throw error(404, 'Project not found');
        }
        return {
            project
        };
    } catch (err) {
        console.error(err);
        throw error(500, 'Failed to load project');
    }
}