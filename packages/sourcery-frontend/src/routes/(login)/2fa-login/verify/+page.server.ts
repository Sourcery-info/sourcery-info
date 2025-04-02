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

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TwoFactorAuth } from '$lib/utils/twoFactor';
import { getUser, updateUser } from '$lib/classes/users';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
    const userId = url.searchParams.get('userId');
    if (!userId) {
        throw redirect(302, '/login');
    }
    return { userId };
};

export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const token = formData.get('code') as string;
        const userId = formData.get('userId') as string;

        if (!token || !userId) {
            return {
                state: 'error',
                message: 'Invalid request'
            };
        }

        const user = await getUser(userId);
        if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
            return {
                state: 'error',
                message: 'Invalid request'
            };
        }

        // Check if it's a backup code
        if (user.two_factor_backup_codes?.length) {
            const { isValid, index } = await TwoFactorAuth.verifyBackupCode(token, user.two_factor_backup_codes);
            if (isValid) {
                // Remove used backup code
                const updatedBackupCodes = [...user.two_factor_backup_codes];
                updatedBackupCodes.splice(index, 1);
                
                await updateUser({
                    ...user,
                    two_factor_backup_codes: updatedBackupCodes
                });
                
                // Create session after successful verification
                const sessionToken = generateSessionToken();
                const session = await createSession(sessionToken, userId);
                setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
                
                throw redirect(302, '/projects');
            }
        }

        // Verify TOTP
        if (!TwoFactorAuth.verifyToken(token, user.two_factor_secret)) {
            return {
                state: 'error',
                message: 'Invalid verification code'
            };
        }

        // Create session after successful verification
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, userId);
        setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

        throw redirect(302, '/projects');
    }
}; 