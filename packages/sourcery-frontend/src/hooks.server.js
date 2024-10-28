/** @type {import('@sveltejs/kit').Handle} */
import { redirect } from '@sveltejs/kit';
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/auth';
import { getUsers } from '$lib/server/user';
export async function handle({ event, resolve }) {
    const route = event.route.id;

    // Check if the route starts with '/(authed)/'
    if (!route?.startsWith('/(authed)/')) {
        const response = await resolve(event);
        return response;
    }

    // Check if we have any users set at all
    const users = await getUsers();
    if (users.length === 0) {
        return redirect(303, "/create-account");
    }
    const token = event.cookies.get("session") ?? null;
    if (!token) {
        return redirect(303, "/login");
    }
    const session = await validateSessionToken(token);
    if (session) {
        setSessionTokenCookie(event.cookies, token, session.expiresAt);
    } else {
        deleteSessionTokenCookie(event.cookies);
        return redirect(303, "/login");
    }
    event.locals.session = session;
    const response = await resolve(event);
    return response;
}
