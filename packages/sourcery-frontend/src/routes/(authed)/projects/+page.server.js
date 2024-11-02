/** @type {import('./$types').PageServerLoad} */
import { getProjects } from '$lib/classes/projects';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    return {
        projects: await getProjects(locals?.session?.user_id)
    }
};