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
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { zfd } from "zod-form-data";
import { createTerms, getAllTermsVersions } from '$lib/classes/terms';
import { incrementVersion } from '$lib/utils/versions';
const termsSchema = zfd.formData({
	version: zfd.text(z.string().regex(/^v\d+\.\d+\.\d+$/, 'Version must be in format vX.Y.Z')),
	content: zfd.text(z.string().min(100, 'Content is too short')),
	active: zfd.checkbox({trueValue: "1"})
});

export const load: PageServerLoad = async () => {
	try {
		const allTerms = await getAllTermsVersions();
		let latestVersion = 'v0.0.0';
		let latestContent = '';
		if (allTerms.length > 0) {
			// Sort by version number to get the latest
			const sortedTerms = allTerms.sort((a, b) => {
				const aVer = a.version.replace('v', '').split('.').map(Number);
				const bVer = b.version.replace('v', '').split('.').map(Number);
				for (let i = 0; i < 3; i++) {
					if (aVer[i] !== bVer[i]) return bVer[i] - aVer[i];
				}
				return 0;
			});
			latestVersion = sortedTerms[0].version;
			latestContent = sortedTerms[0].content;
		}
		
		const nextVersion = incrementVersion(latestVersion, 'minor');
		return {
			latestVersion,
			nextVersion,
			latestContent
		};
	} catch (error) {
		console.error('Error loading terms versions:', error);
		return {
			latestVersion: 'v0.0.0',
			nextVersion: 'v0.1.0',
			latestContent: ''
		};
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const result = await validate(formData, termsSchema);
		if (result.errors) {
			return fail(400, {
				data: Object.fromEntries(formData),
				errors: result.errors
			});
		}

		try {
			// Verify the submitted version matches what we expect
			const data = await getAllTermsVersions();
			let latestVersion = 'v0.0.0';
			if (data.length > 0) {
				const sortedTerms = data.sort((a, b) => {
					const aVer = a.version.replace('v', '').split('.').map(Number);
					const bVer = b.version.replace('v', '').split('.').map(Number);
					for (let i = 0; i < 3; i++) {
						if (aVer[i] !== bVer[i]) return bVer[i] - aVer[i];
					}
					return 0;
				});
				latestVersion = sortedTerms[0].version;
			}
			const nextVersion = incrementVersion(latestVersion, 'minor');
			
			if (result.data.version !== nextVersion) {
				return fail(400, {
					data: Object.fromEntries(formData),
					errors: {
						server: 'Invalid version number submitted. Please refresh and try again.'
					}
				});
			}

			await createTerms(result.data);
			return {
				success: true,
				message: 'Terms & Conditions created successfully'
			};
		} catch (error) {
			console.error('Error creating terms:', error);
			return fail(500, {
				data: Object.fromEntries(formData),
				errors: {
					server: 'An error occurred while creating the terms. Please try again.'
				}
			});
		}
	}
}; 
