/** @type {import('./$types').PageServerLoad} */
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { getUsers, createUser } from '$lib/server/user';
import type { SourceryAccount } from '$lib/types/SourcerySettings.type';
export async function load() {
    return {};
};

function checkUniqueUsername(username: string, usernames: string[]) {
    if (!usernames || usernames.length === 0) {
        return true;
    }
    return !usernames.includes(username);
}

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const usernames = (await getUsers()).map(user => user.username);
        const is_first_user = (!usernames || usernames.length === 0);
        const newAccountScheme = zfd.formData({
            username: zfd.text(z.string().min(3).max(50).refine((username) => checkUniqueUsername(username, usernames), { message: "Username already exists" })),
            name: zfd.text(z.string().min(2).max(100)),
            email: zfd.text(z.string().email({ message: "Invalid email address" })),
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
            const account: SourceryAccount = {
                user_id: "",
                username: validation.data.username,
                password: validation.data.password,
                admin: is_first_user,
                approved: is_first_user,
                avatar: 'default.png',
                otp: null,
                date_created: null,
                last_login: null,
                name: validation.data.name,
                email: validation.data.email
            }
            await createUser(account);
        } catch (err: any) {
            console.error({ err });
            return fail(400, { errors: [error(500, err.toString())], data: validation.data });
        }
        // Note, redirects mustn't be in try/catch block
        redirect(302, '/login');
    }
};
