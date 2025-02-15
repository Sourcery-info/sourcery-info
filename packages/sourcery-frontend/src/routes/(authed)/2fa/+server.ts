import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TwoFactorAuth } from '$lib/utils/twoFactor';
import { error } from '@sveltejs/kit';
import { updateUser, getUser } from '$lib/classes/users';
import { checkUserCredentials } from '$lib/server/user';
import { checkPassword } from '$lib/utils/crypto';

// Initialize 2FA setup - generates secret and QR code
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const secret = TwoFactorAuth.generateSecret();
    const qrCode = await TwoFactorAuth.generateQRCode(locals.user.email, secret);
    const { plainCodes, hashedCodes } = await TwoFactorAuth.generateBackupCodes();

    // Store the secret and hashed backup codes
    const userToUpdate = {
        ...locals.user,
        _id: locals.user.user_id,
        two_factor_secret: secret,
        two_factor_backup_codes: hashedCodes
    };
    await updateUser(userToUpdate);

    return json({ 
        secret,
        qrCode,
        backupCodes: plainCodes // Send plain codes to user for saving
    });
};

// Verify and enable 2FA
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { token } = await request.json();
    
    // Get the latest user data to verify the secret
    const currentUser = await getUser(locals.user.user_id);
    console.log(currentUser);
    if (!currentUser?.two_factor_secret) {
        throw error(400, '2FA setup not initiated');
    }

    if (!TwoFactorAuth.verifyToken(token, currentUser.two_factor_secret)) {
        throw error(400, 'Invalid verification code');
    }

    // Enable 2FA
    const userToUpdate = {
        ...currentUser,
        two_factor_enabled: true
    };
    await updateUser(userToUpdate);

    return json({ success: true });
};

// Disable 2FA
export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const { password } = await request.json();
    
    // Verify password before disabling 2FA
    const isValid = await checkUserCredentials(locals.user.username, password);
    if (!isValid) {
        throw error(400, 'Invalid password');
    }

    // Disable 2FA
    const userToUpdate = {
        ...locals.user,
        _id: locals.user.user_id,
        two_factor_enabled: false,
        two_factor_secret: undefined,
        two_factor_backup_codes: undefined
    };
    console.log(userToUpdate);
    await updateUser(userToUpdate);

    return json({ success: true });
}; 