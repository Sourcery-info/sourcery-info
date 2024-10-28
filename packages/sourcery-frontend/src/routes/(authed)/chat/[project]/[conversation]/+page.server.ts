/** @type {import('./$types').PageServerLoad} */
import Project from '$lib/classes/project';
import { fail } from '@sveltejs/kit';
export async function load({ locals, params }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const project = new Project(locals?.session?.user_id, params.project);
    const data = await project.load();
    console.log(data);
    return {
        project: data,
        conversation: params.conversation
    };
};
