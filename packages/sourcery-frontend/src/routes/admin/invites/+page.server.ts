import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getAllMemberships } from '$lib/classes/memberships';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { validate } from '$lib/validate';
import { MailService } from '$lib/utils/mail';
import { getAllInviteCodes, createInviteCode, updateInviteCode } from '$lib/classes/invite_codes';
import { generateSecureToken } from '$lib/utils/crypto';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user?.admin) {
        throw error(403, 'Unauthorized');
    }

    try {
        const [memberships, invite_codes] = await Promise.all([
            getAllMemberships(),
            getAllInviteCodes()
        ]);

        return {
            memberships,
            invite_codes
        };
    } catch (err) {
        console.error('Error loading invite codes:', err);
        throw error(500, 'Failed to load invite codes');
    }
};

export const actions: Actions = {
    default: async ({ request, locals, url }) => {
        if (!locals.user?.admin) {
            throw error(403, 'Unauthorized');
        }

        const formData = await request.formData();
        const schema = zfd.formData({
            emails: zfd.text(z.string().min(1)),
            membership_id: zfd.text(z.string().min(1)),
            send_email: zfd.checkbox({ trueValue: "1" })
        });

        const validation = await validate(formData, schema);
        if (validation.errors) {
            return fail(400, validation);
        }

        const emails = validation.data.emails
            .split('\n')
            .map((email: string) => email.trim().toLowerCase())
            .filter((email: string) => email.length > 0);

        try {
            const invite_codes = await Promise.all(emails.map(async (email: string) => {
                const code = await generateSecureToken(32);
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

                const inviteCode = await createInviteCode({
                    email,
                    code,
                    membership_id: validation.data.membership_id,
                    expires_at: expiresAt,
                    was_emailed: false,
                    used: false
                });

                if (validation.data.sendEmail && locals.config.smtp_host && locals.config.smtp_user && locals.config.smtp_password) {
                    const mailService = new MailService();

                    const signupUrl = new URL('/create-account', url.origin);
                    signupUrl.searchParams.set('code', code);

                    await mailService.sendTemplateEmail(
                        email,
                        'Invitation to join Sourcery.info',
                        'invite-code',
                        {
                            inviteCode: code,
                            signupUrl: signupUrl.toString(),
                            appName: locals.config.app_name || 'Sourcery.info'
                        }
                    );

                    await updateInviteCode({
                        _id: inviteCode._id,
                        was_emailed: true
                    });
                }

                return inviteCode;
            }));

            return { success: true, invite_codes };
        } catch (err) {
            console.error('Error creating invite codes:', err);
            return fail(500, { message: 'Failed to create invite codes' });
        }
    }
}; 