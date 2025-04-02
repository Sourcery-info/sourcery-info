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
/** @type {import('./$types').Actions} */

import { createProject } from '$lib/classes/projects'
import { fail, redirect, error } from '@sveltejs/kit';
import { zfd } from "zod-form-data";
import { z } from 'zod';
import { validate } from '$lib/validate';
import { checkUniqueName } from '$lib/classes/projects';
import { Settings } from '$lib/classes/settings';

export const load = async ({ locals }) => {
    if (!locals?.session?.user_id) {
        return fail(401, { message: 'Unauthorized' });
    }
    const settings = new Settings(locals?.session?.user_id);
    const default_settings = await settings.all();
    return {
        settings: default_settings
    };
};

export const actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const user_id = locals?.session?.user_id;
        if (!user_id) {
            return fail(400, { errors: [error(400, "User not logged in")] });
        }
        const newProjectScheme = zfd.formData({
            name: zfd.text(z.string().min(3).max(50).refine(async (name) => await checkUniqueName(name, user_id), { message: "Project name already exists" })),
            description: zfd.text(z.string().optional()),
            tags: zfd.text(z.string().optional()),
            notes: zfd.text(z.string().optional()),
            vector_model: zfd.text(z.string()),
            chat_model: zfd.text(z.string()),
            security: zfd.text(z.string().optional()),
            is_public: zfd.checkbox().optional(),
            temperature: zfd.numeric(z.number().min(0).max(1)),
        });
        const validation = await validate(formData, newProjectScheme);
        if (validation.errors) {
            return fail(400, validation);
        }
        const data = {
            ...validation.data,
            owner: locals?.session?.user_id,
        }

        try {
            await createProject(data);
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