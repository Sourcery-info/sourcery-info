/** @type {import('./$types').PageServerLoad} */
/** @type {import('./$types').Actions} */

import { Settings } from '$lib/classes/settings';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';

// const settings = new Settings();

export async function load({ locals }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const settings = new Settings(locals?.session?.user_id);
    return {
        props: {
            settings: await settings.get()
        }
    };
};

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals?.session?.user_id) {
            return fail(401, { message: 'Unauthorized' });
        }
        const settings = new Settings(locals?.session?.user_id);
        const formData = await request.formData();
        const settingsSchema = zfd.formData({
            vector_model: zfd.text(z.string()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1))
        });
        const validation = await validate(formData, settingsSchema);
        if (validation.errors) {
            console.error(validation.errors);
            return fail(400, validation);
        }
        try {
            await settings.set(validation.data);
            // Get the updated settings to return to the client
            const updatedSettings = await settings.get();
            return {
                success: true,
                settings: updatedSettings
            };
        } catch (err) {
            return fail(400, { errors: [err], data: validation.data });
        }
    }
}