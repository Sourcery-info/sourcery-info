/** @type {import('./$types').RequestHandler} */
import { error } from '@sveltejs/kit';
import { markAlertsSeen } from '$lib/classes/alerts';

export async function POST({ locals }) {
    if (!locals?.session?.user_id) {
        throw error(401, 'Unauthorized');
    }
    await markAlertsSeen(locals.session.user_id);
    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}