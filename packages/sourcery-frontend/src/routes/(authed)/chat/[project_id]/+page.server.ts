/** @type {import('./$types').PageServerLoad} */
// import { randomUUID } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import { createConversation } from '$lib/classes/conversations';

export async function load({ params, locals }) {
    if (!locals?.session?.user_id) {
        return redirect(307, '/login');
    }
    const conversation = await createConversation({ user_id: locals?.session?.user_id, project_id: params.project_id, messages: [], created_at: new Date(), updated_at: new Date() });
    console.log(conversation);
    redirect(307, `/chat/${params.project_id}/${conversation._id}`);
};

export const actions = {
}
