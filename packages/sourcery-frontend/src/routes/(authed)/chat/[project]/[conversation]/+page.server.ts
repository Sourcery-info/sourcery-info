/** @type {import('./$types').PageServerLoad} */
import { getProject } from '$lib/classes/projects'
import { fail } from '@sveltejs/kit';
export async function load({ locals, params }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const project = await getProject(params.project);
    if (!project) {
        return fail(404, { message: 'Project not found' });
    }
    return {
        project,
        conversation: params.conversation
    };
};
