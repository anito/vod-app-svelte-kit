import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				allowNodeBuiltins: ['crypto'],
				exclude: ['svelte-kit-cookie-session']
			}
		}
	}
};

export default config;
