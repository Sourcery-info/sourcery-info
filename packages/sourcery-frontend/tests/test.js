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
