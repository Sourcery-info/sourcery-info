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

import { getProject, updateProject } from '$lib/classes/projects';
import { error, fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { Settings } from '$lib/classes/settings';
import type { SourcerySettings } from '$lib/types/SourcerySettings.type';
import { logger } from '@sourcery/common/src/logger';
import { checkUniqueName } from '$lib/classes/projects';

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
            return fail(401, { 
                errors: { server: ['You must be logged in to update project settings'] }
            });
        }
        const formData = await request.formData();
        const user_id = locals?.session?.user_id;
        if (!user_id) {
            return fail(400, { errors: [error(400, "User not logged in")] });
        }
        const _id = params.project_id;
        const settingsSchema = zfd.formData({
            name: zfd.text(z.string().trim().min(3).max(50).refine(async (name) => await checkUniqueName(name, user_id, _id), { message: "Project name already exists" })),
            tags: zfd.text(z.string().optional()),
            description: zfd.text(z.string().optional()),
            notes: zfd.text(z.string().optional()),
            is_public: zfd.checkbox({ trueValue: "true" }).optional(),
            vector_model: zfd.text(z.string().optional()),
            chat_model: zfd.text(z.string()),
            temperature: zfd.numeric(z.number().min(0).max(1).transform(val => val === 0 ? 0 : val || 0.1)),
            security: zfd.text(z.enum(["secure", "insecure"])).optional(),
        });
        const validation = await validate(formData, settingsSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        try {
            await updateProject(Object.assign(validation.data, { _id, updated_at: new Date() }));
            return {
                form: {
                    data: validation.data
                }
            };
        } catch (err) {
            logger.error({ msg: "Error updating project", error: err, tags: ['project', 'error'] });
            return fail(400, { 
                errors: { server: ['Failed to update project settings'] },
                data: validation.data 
            });
        }
    }
}