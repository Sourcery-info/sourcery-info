import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: "web.sourcery.info",
		hmr: {
			// overlay: false,
			host: "web.sourcery.info"
		}
	}
});
