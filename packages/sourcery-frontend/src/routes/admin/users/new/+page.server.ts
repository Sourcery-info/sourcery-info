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
import { hashPassword } from '$lib/utils/crypto';
import type { Actions } from './$types';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { validate } from '$lib/validate';
import { createAlertUrl } from '$lib/alerts';
import { checkUniqueUsername, checkUniqueEmail, createUser } from '$lib/classes/users';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const userScheme = zfd.formData({
			username: zfd.text(z.string().min(3).max(50).refine(async (username) => await checkUniqueUsername(username, null), { message: "Username already exists" })),
			name: zfd.text(z.string().min(1).max(100)),
			email: zfd.text(z.string().email().max(100).refine(async (email) => await checkUniqueEmail(email, null), { message: "Email already exists" })),
			password: zfd.text(z.string().min(8).max(100)),
			approved: zfd.checkbox({trueValue: "1"}),
			admin: zfd.checkbox({trueValue: "1"}),
		});

		const validation = await validate(formData, userScheme);
		if (validation.errors) {
			return fail(400, validation);
		}

		try {
			const hashedPassword = await hashPassword(validation.data.password);
			await createUser({
				...validation.data,
				password_hash: hashedPassword
			});
		} catch (error) {
			console.error('Error creating user:', error);
			return fail(500, { 
				message: 'An error occurred while creating the user. Please try again.',
				data: {
					username: validation.data.username,
					name: validation.data.name,
					email: validation.data.email,
					approved: validation.data.approved,
					admin: validation.data.admin
				}
			});
		}
        return redirect(303, createAlertUrl('/admin/users/list', 'user-created', 'success'));
	}
} 