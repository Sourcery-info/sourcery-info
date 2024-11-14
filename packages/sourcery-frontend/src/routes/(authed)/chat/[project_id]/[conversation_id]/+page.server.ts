/** @type {import('./$types').PageServerLoad} */
import { getProject } from '$lib/classes/projects'
import { fail } from '@sveltejs/kit';
export async function load({ locals, params }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const project_id = params.project_id;
    const project = await getProject(project_id);
    if (!project?._id) {
        return fail(404, { message: 'Project not found' });
    }
    return {
        project,
        conversation_id: params.conversation_id
    };
};
