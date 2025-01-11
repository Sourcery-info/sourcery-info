/** @type {import('./$types').PageServerLoad} */

import { getProjects } from '$lib/classes/projects';
export async function load() {
    const projects = await getProjects('*');
    return {
        projects
    };
}; 