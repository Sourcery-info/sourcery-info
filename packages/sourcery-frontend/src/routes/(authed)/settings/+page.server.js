/** @type {import('./$types').PageServerLoad} */
/** @type {import('./$types').Actions} */

import { Settings } from '$lib/classes/settings';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';

const settings = new Settings();

export async function load() {
    const settings = new Settings();
    return {
        props: {
            settings: settings.get()
        }
    };
};

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const settingsSchema = zfd.formData({
            vector_model: zfd.text(z.string()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1)),
            security: zfd.text(z.enum(["secure", "insecure"])), // It would be nice if the values were derived from the SourcerySecurity enum
        });
        const validation = validate(formData, settingsSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        // const project = new Project();
        try {
            settings.set(validation.data);
        } catch (err) {
            return fail(400, { errors: [err], data: validation.data });
        }
        // redirect(303, '/projects');
        return redirect(303, '/settings');
        
    }
}