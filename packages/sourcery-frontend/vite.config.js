import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const domain = process.env.ORIGIN ? new URL(process.env.ORIGIN).hostname : 'web.sourcery.info';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: domain,
		hmr: {
			// overlay: false,
			host: domain
		}
	}
});
