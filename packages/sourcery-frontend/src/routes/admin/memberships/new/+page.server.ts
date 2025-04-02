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

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createMembership, updateMembership, getAllMemberships, getMembershipById } from '$lib/classes/memberships';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { checkUniqueName } from '$lib/classes/memberships';

export const load: PageServerLoad = async () => {
    try {
        const memberships = await getAllMemberships();
        return { memberships };
    } catch (err) {
        console.error('Error loading memberships:', err);
        throw error(500, 'Failed to load memberships');
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const membershipSchema = zfd.formData({
            name: zfd.text(z.string().min(3).max(50).refine(checkUniqueName, { message: 'Membership name already exists' })),
            document_limit: zfd.numeric(z.number().min(0)),
            page_limit: zfd.numeric(z.number().min(0))
        });
        const validation = await validate(formData, membershipSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        try {
            const newMembership = await createMembership(validation.data);
            return { success: true, data: newMembership };
        } catch (err) {
            console.error('Error creating membership:', err);
            return fail(500, { message: 'Failed to create membership' });
        }
    },
}; 