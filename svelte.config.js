import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: {
			server: {
				port: process.env.PORT || 3000
			}
		}
	}
};

export default config;
