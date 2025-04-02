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
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { getUsers, createUser, checkUniqueUsername, checkUniqueEmail, getUserCount } from '$lib/classes/users';
import { MailService } from '$lib/utils/mail';
import type { User } from '@sourcery/common/types/User.type';
import { getInviteCodeByCode, updateInviteCode } from '$lib/classes/invite_codes';

export async function load({ url }) {
    const code = url.searchParams.get('code');
    const is_first_user = await getUserCount() === 0;
    if (code) {
        const inviteCode = await getInviteCodeByCode(code);
        if (!inviteCode || inviteCode.used || new Date(inviteCode.expires_at) < new Date()) {
            throw error(400, 'Invalid or expired invite code');
        }
        return {
            inviteCode: {
                code: inviteCode.code,
                email: inviteCode.email
            }
        };
    }
    return {
        is_first_user
    };
};

export const actions = {
    default: async ({ request, url, locals }) => {
        const formData = await request.formData();
        const usernames = (await getUsers()).map(user => user.username);
        const is_first_user = (!usernames || usernames.length === 0);
        const inviteCode = formData.get('inviteCode');

        const newAccountScheme = zfd.formData({
            username: zfd.text(z.string().min(3).max(50).refine((username) => checkUniqueUsername(username), { message: "Username already exists" })),
            name: zfd.text(z.string().min(2).max(100)),
            email: zfd.text(z.string().email({ message: "Invalid email address" }).refine((email) => checkUniqueEmail(email), { message: "Email already exists" })),
            password: zfd.text(z.string().min(8)),
            confirmPassword: zfd.text(z.string().min(8)),
            inviteCode: zfd.text(z.string().optional())
        });

        const validation = await validate(formData, newAccountScheme);
        if (validation.errors) {
            return fail(400, { 
                errors: validation.errors, 
                data: Object.fromEntries(formData)
            });
        }

        // Check passwords match
        if (formData.get('password') !== formData.get('confirmPassword')) {
            return fail(400, { 
                errors: { confirmPassword: 'Passwords do not match' }, 
                data: Object.fromEntries(formData)
            });
        }

        try {
            let isApproved = is_first_user;
            let membershipId = undefined;

            // Check invite code if provided
            if (inviteCode) {
                const invite = await getInviteCodeByCode(inviteCode.toString());
                if (!invite || invite.used || new Date(invite.expires_at) < new Date()) {
                    return fail(400, { 
                        errors: { inviteCode: 'Invalid or expired invite code' }, 
                        data: Object.fromEntries(formData)
                    });
                }
                if (invite.email !== validation.data.email) {
                    return fail(400, { 
                        errors: { email: 'Email does not match invite code' }, 
                        data: Object.fromEntries(formData)
                    });
                }
                isApproved = true;
                membershipId = invite.membership_id;

                // Mark invite code as used
                invite.used = true;
                invite.used_at = new Date();
                await updateInviteCode(invite);
            }

            const account: Omit<User, "_id" | "password_hash" | "created_at" | "updated_at"> = {
                username: validation.data.username,
                password: validation.data.password,
                admin: is_first_user,
                approved: isApproved,
                name: validation.data.name,
                email: validation.data.email,
                membership_id: membershipId ? [membershipId] : [],
                two_factor_enabled: false,
                two_factor_secret: undefined,
                two_factor_backup_codes: []
            }
            const user = await createUser(account);

            // Check if SMTP is configured and send email to admin
            if (!isApproved && locals.config.smtp_host && locals.config.smtp_user && locals.config.smtp_password && locals.config.admin_email) {
                const mailService = new MailService({
                    host: locals.config.smtp_host,
                    port: parseInt(locals.config.smtp_port || '587'),
                    secure: false,
                    auth: {
                        user: locals.config.smtp_user,
                        pass: locals.config.smtp_password
                    },
                    defaultFrom: `${locals.config.smtp_from_name || 'Sourcery.info'} <${locals.config.smtp_from_email || locals.config.smtp_user}>`
                });

                // Generate admin URL for reviewing the user
                const adminUrl = new URL(`/admin/users/edit/${user._id}`, url.origin).toString();

                await mailService.sendTemplateEmail(
                    locals.config.admin_email,
                    'New Sourcery Account Registration',
                    'new-user-notification',
                    {
                        appName: locals.config.app_name || 'Sourcery.info',
                        userName: account.name,
                        username: account.username,
                        userEmail: account.email,
                        isApproved,
                        adminUrl: !isApproved ? adminUrl : undefined
                    }
                );
            }
        } catch (err: any) {
            console.error({ err });
            return fail(400, { errors: [error(500, err.toString())], data: validation.data });
        }
        // Note, redirects mustn't be in try/catch block
        redirect(302, '/login');
    }
};
