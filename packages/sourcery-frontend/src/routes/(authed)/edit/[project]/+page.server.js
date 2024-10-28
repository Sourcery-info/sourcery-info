/** @type {import('./$types').PageServerLoad} */
/** @type {import('./$types').Actions} */

import Projects from '$lib/classes/projects';
import Project from '$lib/classes/project';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';

export async function load({ locals, params }) {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const projects = new Projects(locals?.session?.user_id);
    const project = projects.get_project(params.project);
    if (!project) return fail(404, { error: 'Project not found' });
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
        const urlid = params.project;
        const settingsSchema = zfd.formData({
            name: zfd.text(z.string().trim().min(3).max(50)),
            tags: zfd.text(z.string()),
            description: zfd.text(z.string()),
            notes: zfd.text(z.string()),
            vector_model: zfd.text(z.string()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1)),
            security: zfd.text(z.enum(["secure", "insecure"])), // It would be nice if the values were derived from the SourcerySecurity enum
        });
        const validation = await validate(formData, settingsSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        const project = new Project(locals?.session?.user_id, urlid);
        try {
            project.save(Object.assign(validation.data, { urlid, updated_at: new Date() }));
        } catch (err) {
            return fail(400, { errors: [err], data: validation.data });
        }
        return redirect(303, `/edit/${urlid}`);
    }
}