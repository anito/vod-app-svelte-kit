import adapter from '@sveltejs/adapter-vercel';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      assets: "src/assets",
    },
    csrf: {
      checkOrigin: false,
    },
  },
  preprocess: preprocess(),
};

export default config;
