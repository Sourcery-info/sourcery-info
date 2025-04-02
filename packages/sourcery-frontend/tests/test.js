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

import { expect, test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const origin = process.env.ORIGIN;

if (!origin) {
	throw new Error('ORIGIN is not set');
}

test('index page has expected h1', async ({ page }) => {
	await page.goto(origin);
	await expect(page.getByRole('heading', { name: 'Sourcery.info' })).toBeVisible();
});
