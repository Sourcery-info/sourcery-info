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

import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { updateUser, getUser, checkUserCredentials } from '$lib/server/user';
import { createAlertUrl } from '$lib/alerts';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }
    const user = await getUser(locals.user.user_id);
    console.log(user);
    return {
        user: user
    };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const formData = await request.formData();
        
        const profileSchema = zfd.formData({
            username: zfd.text(z.string().min(3).max(50)),
            name: zfd.text(z.string().min(1).max(100)),
            email: zfd.text(z.string().email()),
            currentPassword: zfd.text(z.string().optional()),
            newPassword: zfd.text(z.string().min(8).optional()),
            confirmPassword: zfd.text(z.string().min(8).optional())
        });

        const validation = await validate(formData, profileSchema);
        if (validation.errors) {
            return fail(400, { 
                errors: validation.errors, 
                data: Object.fromEntries(formData)
            });
        }

        // If changing password, verify passwords match
        if (validation.data.newPassword) {
            if (!validation.data.currentPassword) {
                return fail(400, { 
                    errors: { currentPassword: 'Current password is required to set new password' }, 
                    data: Object.fromEntries(formData)
                });
            }
            if (validation.data.newPassword !== validation.data.confirmPassword) {
                return fail(400, { 
                    errors: { confirmPassword: 'Passwords do not match' }, 
                    data: Object.fromEntries(formData)
                });
            }
            const passwordMatches = await checkUserCredentials(locals.user.username, validation.data.currentPassword);
            if (!passwordMatches) {
                return fail(400, { 
                    errors: { currentPassword: 'Current password is incorrect' }, 
                    data: Object.fromEntries(formData)
                });
            }
        }

        try {
            await updateUser(locals.user.user_id, validation.data);
            return { success: true };
        } catch (err: any) {
            console.error({ err });
            return fail(400, { 
                errors: { form: 'Failed to update profile' }, 
                data: Object.fromEntries(formData)
            });
        }
    }
};