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

import { fail, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { createAlertUrl } from '$lib/alerts';
import { checkUniqueName, createProject } from '$lib/classes/projects';

export const actions = {
    default: async ({ request, locals }) => {
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
            await createProject({
                ...validation.data,
                _id: '',
                urlid: null,
                owner: user_id,
                created_at: new Date(),
                updated_at: new Date()
            });
            return { success: true, data: validation.data };
        } catch (error) {
            console.error('Error creating project:', error);
            return fail(500, { 
                message: 'An error occurred while creating the project. Please try again.',
                data: validation.data
            });
        }
    }
} 