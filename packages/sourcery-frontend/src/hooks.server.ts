/** @type {import('@sveltejs/kit').Handle} */
import { redirect } from '@sveltejs/kit';
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/auth';
import { getUser, getUserCount } from '$lib/server/user';
// @ts-ignore
import { MONGO_URL } from '$env/static/private';
import { connectDB } from '$lib/server/db';
import { createAlertUrl } from '$lib/alerts';
import { getConfigs } from '$lib/classes/config';
import { logger, loggerMiddleware } from '@sourcery/common/src/logger';
import type { Handle } from '@sveltejs/kit';
import { getState } from '$lib/server/state';

connectDB(MONGO_URL).then(() => {
    logger.info({ msg: 'Connected to MongoDB' });
}).catch((err) => {
    logger.error({ msg: 'Error connecting to MongoDB', error: err });
});

export const handle: Handle = async ({ event, resolve }) => {
    // Start with logging middleware
    const wrappedResolve = async (event: any) => {
        const route = event.route.id;
        // Parse alert from URL if present
        const configs = await getConfigs();
        event.locals.config = {};
        for (let config of configs) {
            event.locals.config[config.key] = config.value;
        }

        if (route === '/state') {
            const state = await getState(event);
            return new Response(JSON.stringify(state));
        }

        // Check if the route doesn't start with '/(authed)/' or '/admin/'
        if (!route?.startsWith('/(authed)/') && !route?.startsWith('/admin')) {
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

        // If accessing admin pages, check if the user is an admin
        if (route?.startsWith('/admin') && !user.admin) {
            return redirect(303, createAlertUrl('/projects', 'unauthorized', 'danger'));
        }

        // Check if the user is approved
        if (!user.approved) {
            return redirect(303, "/awaiting-authorization");
        }

        // Set the user in the locals
        event.locals.user = user;

        const response = await resolve(event);
        return response;
    };

    // Apply logging middleware with our wrapped resolve function
    return loggerMiddleware({ event, resolve: wrappedResolve });
};
