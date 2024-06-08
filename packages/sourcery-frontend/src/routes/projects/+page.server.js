/** @type {import('./$types').PageServerLoad} */
import Projects from '$lib/classes/projects';

export async function load() {
    const projects = new Projects();
    let proj_data = projects.projects;
    return {
        projects: proj_data
    };
};