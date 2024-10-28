/** @type {import('./$types').PageServerLoad} */
import Project from '$lib/classes/project';

export async function load({ params }) {
    const project = new Project(params.project);
    return {
        project: project.get(),
        conversation: params.conversation
    };
};

export const actions = {
}
