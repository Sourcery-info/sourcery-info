/** @type {import('./$types').PageServerLoad} */

import { getProject, updateProject, checkUniqueName } from '$lib/classes/projects';
import { fail, redirect } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { createAlertUrl } from '$lib/alerts';

export async function load({ params }) {
    const project = await getProject(params.project_id);
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
        const user_id = locals.session.user_id;
        const projectSchema = zfd.formData({
            name: zfd.text(z.string().min(3).max(50).refine(async (name) => await checkUniqueName(name, user_id), { message: "Project name already exists" })),
            description: zfd.text(z.string().optional()),
            notes: zfd.text(z.string().optional()),
            is_public: zfd.checkbox({trueValue: "1"}),
            vector_model: zfd.text(z.string().optional()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1)),
            security: zfd.text(z.enum(["secure", "insecure"])),
            tags: zfd.text(z.string().optional()),
        });

        const validation = await validate(formData, projectSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        
        try {
            await updateProject({
                ...validation.data,
                _id: params.project_id,
                urlid: null,
                owner: user_id,
                updated_at: new Date()
            });
        } catch (err) {
            console.error(err);
            return fail(500, { message: "Failed to update project" });
        }
        return redirect(303, createAlertUrl('/admin/projects/list', 'changes-saved'));
    }
}; 