/** @type {import('./$types').PageServerLoad} */
/** @type {import('./$types').Actions} */

import { getProject, updateProject } from '$lib/classes/projects';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { Settings } from '$lib/classes/settings';
import type { SourcerySettings } from '$lib/types/SourcerySettings.type';

export async function load({ locals, params }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const project = await getProject(params.project_id);
    if (!project) return fail(404, { error: 'Project not found' });
    const settings = new Settings(locals.session.user_id);
    const default_settings = await settings.get() as SourcerySettings;
    if (!default_settings) return fail(404, { error: 'Settings not found' });
    project.temperature = project.temperature || default_settings.temperature;
    project.security = project.security || default_settings.security;
    return {
        project
    };
};

export const actions = {
    default: async ({ request, params, locals }) => {
        if (!locals?.session?.user_id) {
            return fail(401, { message: 'Unauthorized' });
        }
        const formData = await request.formData();
        const _id = params.project_id;
        const settingsSchema = zfd.formData({
            name: zfd.text(z.string().trim().min(3).max(50)),
            tags: zfd.text(z.string().optional()),
            description: zfd.text(z.string().optional()),
            notes: zfd.text(z.string().optional()),
            is_public: zfd.checkbox({ trueValue: "true" }),
            vector_model: zfd.text(z.string().optional()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1)),
            security: zfd.text(z.enum(["secure", "insecure"])), // It would be nice if the values were derived from the SourcerySecurity enum
        });
        console.log(formData);
        const validation = await validate(formData, settingsSchema);
        if (validation.errors) {
            console.log(validation.errors);
            return fail(400, validation);
        }
        console.log(validation.data);
        try {
            updateProject(Object.assign(validation.data, { _id, updated_at: new Date() }));
        } catch (err) {
            return fail(400, { errors: [err], data: validation.data });
        }
        return redirect(303, `/project/${_id}/settings`);
    }
}