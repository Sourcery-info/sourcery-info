// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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