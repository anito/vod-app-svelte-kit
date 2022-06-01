import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				exclude: ['svelte-kit-cookie-session'],
				allowNodeBuiltins: ['crypto']
			},
			server: {
				port: process.env.PORT || 3000
			}
		}
	}
};

export default config;
