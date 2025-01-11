/** @type {import('./$types').PageServerLoad} */

import { getUser, updateUser, checkUniqueUsername } from '$lib/server/user';
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { createAlertUrl } from '$lib/alerts';

export async function load({ locals, params }) {
    const user = await getUser(params.user_id);
    return {
        user
    };
};

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const userScheme = zfd.formData({
            username: zfd.text(z.string().min(3).max(50).refine(async (username) => await checkUniqueUsername(username, params.user_id), { message: "Username already exists" })),
            name: zfd.text(z.string().min(1).max(100)),
            email: zfd.text(z.string().email().max(100)),
            approved: zfd.checkbox({trueValue: "1"}),
            admin: zfd.checkbox({trueValue: "1"}),
        });
        const validation = await validate(formData, userScheme);
        if (validation.errors) {
            return fail(400, validation);
        }
        
        const user = {
            _id: params.user_id,
            ...validation.data
        }
        try {
            await updateUser(params.user_id, user);
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Failed to update user" });
        }
        return redirect(303, createAlertUrl('/admin/users/list', 'changes-saved'));
    }
};