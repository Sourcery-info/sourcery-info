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
import { getPrivacyPolicyById, updatePrivacyPolicy } from '$lib/classes/privacy';
import { zfd } from "zod-form-data";
import { incrementVersion } from '$lib/utils/versions';

export const load: PageServerLoad = async ({ params }) => {
    const policy = await getPrivacyPolicyById(params.privacy_id);
    if (!policy) {
        throw error(404, 'Privacy Policy not found');
    }
    const nextVersion = incrementVersion(policy.version, 'patch');
    return { policy, nextVersion };
};

const privacyPolicySchema = zfd.formData({
    version: zfd.text(z.string().min(1, 'Version is required')),
    content: zfd.text(z.string().min(1, 'Content is required')),
    active: zfd.checkbox({trueValue: "1"})
});

export const actions = {
    default: async ({ request, params }) => {
        const policy = await getPrivacyPolicyById(params.privacy_id);
        if (!policy) {
            return fail(404, { errors: { server: ['Privacy Policy not found'] } });
        }

        try {
            const result = await privacyPolicySchema.parse(await request.formData());
            console.log(result);
            await updatePrivacyPolicy({
                ...policy,
                ...result
            });
            return {
                success: true,
                message: 'Privacy Policy updated successfully'
            };
        } catch (error) {
            const nextVersion = incrementVersion(policy.version, 'patch');
            if (error instanceof z.ZodError) {
                return fail(400, {
                    data: { ...policy, nextVersion },
                    errors: error.flatten().fieldErrors
                });
            }
            console.error('Error updating privacy policy:', error);
            return fail(500, {
                data: { ...policy, nextVersion },
                errors: { server: ['Failed to update Privacy Policy'] }
            });
        }
    }
}; 
