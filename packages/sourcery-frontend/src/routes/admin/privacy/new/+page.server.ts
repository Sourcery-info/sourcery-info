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

import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPrivacyPolicy, getAllPrivacyPolicyVersions } from '$lib/classes/privacy';
import { incrementVersion } from '$lib/utils/versions';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';

const privacyPolicySchema = zfd.formData({
    version: zfd.text(z.string().regex(/^v\d+\.\d+\.\d+$/, 'Version must be in format vX.Y.Z')),
    content: zfd.text(z.string().min(100, 'Content is too short')),
    active: zfd.checkbox({trueValue: "1"})
});

export const load: PageServerLoad = async () => {
    const allPolicies = await getAllPrivacyPolicyVersions();
    let latestVersion = 'v0.0.0';
    let latestContent = '';
    if (allPolicies.length > 0) {
        // Sort by version number to get the latest
        const sortedPolicies = allPolicies.sort((a, b) => {
            const aVer = a.version.replace('v', '').split('.').map(Number);
            const bVer = b.version.replace('v', '').split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (aVer[i] !== bVer[i]) return bVer[i] - aVer[i];
            }
            return 0;
        });
        latestVersion = sortedPolicies[0].version;
        latestContent = sortedPolicies[0].content;
    }
    const nextVersion = incrementVersion(latestVersion, 'minor');
    const privacyPolicy = {
        version: nextVersion,
        content: '',
        active: false
    };
    return { latestVersion, nextVersion, latestContent, privacyPolicy };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const result = await validate(formData, privacyPolicySchema);
        if (result.errors) {
            return fail(400, {
                data: Object.fromEntries(formData),
                errors: result.errors
            });
        }

        try {
            await createPrivacyPolicy(result.data);
            return {
                success: true,
                message: 'Privacy Policy created successfully'
            };
        } catch (error) {
            console.error('Error creating privacy policy:', error);
            return fail(500, { errors: { server: ['Error creating privacy policy'] } });
        }
    }
}; 