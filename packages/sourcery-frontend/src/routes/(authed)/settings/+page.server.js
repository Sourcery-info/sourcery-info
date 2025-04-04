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