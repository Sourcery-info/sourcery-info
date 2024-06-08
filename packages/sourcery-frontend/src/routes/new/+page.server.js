/** @type {import('./$types').PageServerLoad} */
/** @type {import('./$types').Actions} */

import Project from '$lib/classes/project';
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { check_unique } from '$lib/classes/project';

export async function load() {
    return {};
};

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const newProjectScheme = zfd.formData({
            name: zfd.text(z.string().min(3).max(50).refine(check_unique, { message: "Project name already exists" })),
            description: zfd.text(z.string().optional()),
            tags: zfd.text(z.string().optional()),
            notes: zfd.text(z.string().optional()),
            vector_model: zfd.text(z.string()),
            chat_model: zfd.text(z.string()),
            security: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1)),
        });
        const validation = validate(formData, newProjectScheme);
        if (validation.errors) {
            return fail(400, validation);
        }
        const project = new Project();
        try {
            project.save(validation.data);
        } catch (err) {
            if (err instanceof Error) {
                return fail(400, { errors: [error(500, err.toString())], data: validation.data });
            } else {
                return fail(400, { errors: [error(500, "An error occurred")], data: validation.data });
            }
        }
        redirect(303, '/projects');
    }
}