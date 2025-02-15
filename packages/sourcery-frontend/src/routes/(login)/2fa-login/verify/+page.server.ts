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