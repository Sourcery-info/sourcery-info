/** @type {import('./$types').PageServerLoad} */
import { redirect } from '@sveltejs/kit';
import { checkUserCredentials } from '$lib/server/user';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export async function load() {
    return {};
};

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const isValid = await checkUserCredentials(username, password);
        console.log(isValid);
        if (!isValid) {
            return {
                state: "error",
                message: 'Invalid username or password'
            };
        }
        const token = generateSessionToken();
        const session = await createSession(token, username);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        redirect(302, '/projects');
    }
};