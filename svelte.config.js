import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				exclude: ['svelte-kit-cookie-session'],
				allowNodeBuiltins: ['crypto']
			}
		}
	}
};

export default config;
