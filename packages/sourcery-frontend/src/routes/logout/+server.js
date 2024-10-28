import { deleteSessionTokenCookie } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
    console.log(cookies.get('session'));
    deleteSessionTokenCookie(cookies);
    redirect(302, '/login');
};