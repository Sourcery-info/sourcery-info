/** @type {import('@sveltejs/kit').Handle} */
import { redirect } from '@sveltejs/kit';
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/auth';
import { getUser, getUserCount } from '$lib/server/user';
import { MONGO_URL } from '$env/static/private';
import { connectDB } from '$lib/server/db';
import { alertMessages, createAlertUrl } from '$lib/alerts';

connectDB(MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
})
    .catch((e) => {
        console.log('MongoDB failed to connect');
        console.error(e);
    });

export async function handle({ event, resolve }) {
    const route = event.route.id;

    // Parse alert from URL if present
    const alertCode = event.url.searchParams.get('alert');
    const alertType = event.url.searchParams.get('type') || 'info';
    if (alertCode) {
        const message = alertCode in alertMessages 
            ? alertMessages[alertCode as keyof typeof alertMessages] 
            : alertCode;
        event.locals.alerts = [{
            type: alertType,
            message
        }];
    }

    // Check if the route starts with '/(authed)/'
    if (!route?.startsWith('/(authed)/')) {
        const response = await resolve(event);
        return response;
    }

    // Check if we have any users set at all
    const userCount = await getUserCount();
    if (userCount === 0) {
        return redirect(303, "/create-account");
    }

    // Check if we have a valid session token
    const token = event.cookies.get("session") ?? null;
    if (!token) {
        return redirect(303, createAlertUrl('/login', 'login-required', 'danger'));
    }

    // Validate the session token
    const session = await validateSessionToken(token);
    if (session) {
        setSessionTokenCookie(event.cookies, token, session.expiresAt);
    } else {
        deleteSessionTokenCookie(event.cookies);
        return redirect(303, createAlertUrl('/login', 'login-required', 'danger'));
    }

    event.locals.session = session;

    // Get the user
    const user = await getUser(session.user_id);
    if (!user) {
        return redirect(303, createAlertUrl('/login', 'login-required', 'danger'));
    }

    // Check if the user is approved
    if (!user.approved) {
        return redirect(303, "/awaiting-authorization");
    }

    // If accessing admin pages, check if the user is an admin
    if (route?.startsWith('/(authed)/admin/') && !user.admin) {
        return redirect(303, createAlertUrl('/projects', 'unauthorized', 'danger'));
    }

    // Set the user in the locals
    event.locals.user = user;

    const response = await resolve(event);
    return response;
}
