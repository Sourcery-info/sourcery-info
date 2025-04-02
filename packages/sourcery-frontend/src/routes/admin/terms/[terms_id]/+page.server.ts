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
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { getTermsById, updateTerms } from '$lib/classes/terms';
import { zfd } from "zod-form-data";
import { incrementVersion } from '$lib/utils/versions';

export const load: PageServerLoad = async ({ params }) => {
    const terms = await getTermsById(params.terms_id);
    if (!terms) {
        throw error(404, 'Terms & Conditions not found');
    }
    const nextVersion = incrementVersion(terms.version, 'patch');
    return { terms, nextVersion };
};

const termsSchema = zfd.formData({
    version: zfd.text(z.string().min(1, 'Version is required')),
    content: zfd.text(z.string().min(1, 'Content is required')),
    active: zfd.checkbox({trueValue: "1"})
});

export const actions = {
    default: async ({ request, params }) => {
        const terms = await getTermsById(params.terms_id);
        if (!terms) {
            return fail(404, { errors: { server: ['Terms & Conditions not found'] } });
        }

        try {
            const result = await termsSchema.parse(await request.formData());
            console.log(result);
            await updateTerms({
                ...terms,
                ...result
            });
            return {
                success: true,
                message: 'Terms & Conditions updated successfully'
            };
        } catch (error) {
            const nextVersion = incrementVersion(terms.version, 'patch');
            if (error instanceof z.ZodError) {
                return fail(400, {
                    data: { ...terms, nextVersion },
                    errors: error.flatten().fieldErrors
                });
            }
            console.error('Error updating terms:', error);
            return fail(500, {
                data: { ...terms, nextVersion },
                errors: { server: ['Failed to update Terms & Conditions'] }
            });
        }
    }
}; 
