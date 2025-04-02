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

import { getUser, updateUser, checkUniqueUsername, checkUniqueEmail } from '$lib/classes/users';
import { getAllMemberships } from '$lib/classes/memberships';
import { fail } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { MailService } from '$lib/utils/mail';

export async function load({ params }) {
    const [user, memberships] = await Promise.all([
        getUser(params.user_id),
        getAllMemberships()
    ]);
    return {
        user,
        memberships
    };
};

export const actions = {
    default: async ({ request, params, url, locals }) => {
        const formData = await request.formData();
        const userScheme = zfd.formData({
            user_username: zfd.text(z.string().min(3).max(50).refine(async (username) => await checkUniqueUsername(username, params.user_id), { message: "Username already exists" })),
            name: zfd.text(z.string().min(1).max(100)),
            email: zfd.text(z.string().email().max(100).refine(async (email) => await checkUniqueEmail(email, params.user_id), { message: "Email already exists" })),
            approved: zfd.checkbox({trueValue: "1"}),
            admin: zfd.checkbox({trueValue: "1"}),
            membership_id: zfd.repeatable(z.array(zfd.text())),
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
                username: validation.data.user_username,
                membership_id: validation.data.membership_id || [],
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
            return { 
                success: true,
                data: {
                    _id: params.user_id,
                    username: validation.data.user_username,
                    name: validation.data.name,
                    email: validation.data.email,
                    approved: validation.data.approved,
                    admin: validation.data.admin,
                    membership_id: validation.data.membership_id || []
                }
            };
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Failed to update user" });
        }
    }
};