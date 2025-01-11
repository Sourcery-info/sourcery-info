/** @type {import('./$types').PageServerLoad} */

import { getUser, updateUser, checkUniqueUsername, checkUniqueEmail } from '$lib/classes/users';
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { createAlertUrl } from '$lib/alerts';
import { MailService } from '$lib/utils/mail';

export async function load({ locals, params }) {
    const user = await getUser(params.user_id);
    return {
        user
    };
};

export const actions = {
    default: async ({ request, params, url, locals }) => {
        const formData = await request.formData();
        const userScheme = zfd.formData({
            username: zfd.text(z.string().min(3).max(50).refine(async (username) => await checkUniqueUsername(username, params.user_id), { message: "Username already exists" })),
            name: zfd.text(z.string().min(1).max(100)),
            email: zfd.text(z.string().email().max(100).refine(async (email) => await checkUniqueEmail(email, params.user_id), { message: "Email already exists" })),
            approved: zfd.checkbox({trueValue: "1"}),
            admin: zfd.checkbox({trueValue: "1"}),
        });
        const validation = await validate(formData, userScheme);
        if (validation.errors) {
            return fail(400, validation);
        }
        
        try {
            // Get the current user state to check if approval status changed
            const currentUser = await getUser(params.user_id);
            const wasApproved = currentUser.approved;
            
            const user = {
                _id: params.user_id,
                ...validation.data
            }
            await updateUser(user);

            // Check if user was just approved and send email if SMTP is configured
            if (!wasApproved && user.approved && locals.config.smtp_host) {
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

                const loginUrl = new URL('/login', url.origin).toString();

                await mailService.sendTemplateEmail(
                    user.email,
                    'Your Account Has Been Approved',
                    'account-approved',
                    {
                        appName: locals.config.app_name || 'Sourcery.info',
                        userName: user.name,
                        userEmail: user.email,
                        loginUrl
                    }
                );
            }
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Failed to update user" });
        }
        return redirect(303, createAlertUrl('/admin/users/list', 'changes-saved'));
    }
};