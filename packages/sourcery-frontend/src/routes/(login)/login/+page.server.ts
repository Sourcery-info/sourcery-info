/** @type {import('./$types').PageServerLoad} */
import { redirect } from '@sveltejs/kit';
import { checkUserCredentials } from '$lib/server/user';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { getUser } from '$lib/classes/users';

export async function load() {
    return {};
};

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const user_id = await checkUserCredentials(username, password);
        if (!user_id) {
            return {
                state: "error",
                message: 'Invalid username or password'
            };
        }

        // Check if 2FA is enabled
        const user = await getUser(user_id);
        if (user?.two_factor_enabled) {
            return {
                state: "2fa_required",
                userId: user_id
            };
        }

        const token = generateSessionToken();
        const session = await createSession(token, user_id);
        setSessionTokenCookie(cookies, token, session.expiresAt);
        throw redirect(302, '/projects');
    }
};