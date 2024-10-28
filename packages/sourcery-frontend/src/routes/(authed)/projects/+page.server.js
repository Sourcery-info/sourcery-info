/** @type {import('./$types').PageServerLoad} */
import Projects from '$lib/classes/projects';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    const projects = new Projects(locals?.session?.user_id);
    return {
        projects: await projects.load_projects()
    }
};