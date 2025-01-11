/** @type {import('./$types').PageServerLoad} */
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { getUsers, createUser, checkUniqueUsername, checkUniqueEmail } from '$lib/classes/users';
import type { SourceryAccount } from '$lib/types/SourcerySettings.type';
import { getConfig } from '$lib/classes/config';
import { MailService } from '$lib/utils/mail';
import type { User } from '@sourcery/common/types/User.type';

export async function load() {
    return {};
};

export const actions = {
    default: async ({ request, url, locals }) => {
        const formData = await request.formData();
        const usernames = (await getUsers()).map(user => user.username);
        const is_first_user = (!usernames || usernames.length === 0);
        const newAccountScheme = zfd.formData({
            username: zfd.text(z.string().min(3).max(50).refine((username) => checkUniqueUsername(username), { message: "Username already exists" })),
            name: zfd.text(z.string().min(2).max(100)),
            email: zfd.text(z.string().email({ message: "Invalid email address" }).refine((email) => checkUniqueEmail(email), { message: "Email already exists" })),
            password: zfd.text(z.string().min(8)),
            confirmPassword: zfd.text(z.string().min(8))
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
            const account: Omit<User, "_id" | "password_hash" | "created_at" | "updated_at"> = {
                username: validation.data.username,
                password: validation.data.password,
                admin: is_first_user,
                approved: is_first_user,
                name: validation.data.name,
                email: validation.data.email
            }
            const user = await createUser(account);

            // Check if SMTP is configured and send email to admin
            if (locals.config.smtp_host && locals.config.smtp_user && locals.config.smtp_password && locals.config.admin_email) {
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
                        isApproved: is_first_user,
                        adminUrl: !is_first_user ? adminUrl : undefined
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
