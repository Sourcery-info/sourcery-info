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
import { updateMembership, getMembershipById } from '$lib/classes/memberships';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { checkUniqueName } from '$lib/classes/memberships';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const { membership_id } = params;
        const membership = await getMembershipById(membership_id);
        return { membership };
    } catch (err) {
        console.error('Error loading membership:', err);
        throw error(500, 'Failed to load membership');
    }
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const membershipSchema = zfd.formData({
            name: zfd.text(z.string().min(3).max(50).refine(async (name) => await checkUniqueName(name, params.membership_id), { message: 'Membership name already exists' })),
            document_limit: zfd.numeric(z.number().min(0)),
            page_limit: zfd.numeric(z.number().min(0))
        });
        const validation = await validate(formData, membershipSchema);
        if (validation.errors) {
            return fail(400, validation);
        }
        try {
            const data = {
                _id: params.membership_id,
                name: validation.data.name,
                document_limit: validation.data.document_limit,
                page_limit: validation.data.page_limit
            };
            const updatedMembership = await updateMembership(data);
            return { success: true, data: updatedMembership };
        } catch (err) {
            console.error('Error updating membership:', err);
            return fail(500, { message: 'Failed to update membership' });
        }
    },
}; 