import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      assets: 'src/assets'
    },
    version: {
      name: pkg.version,
      pollInterval: 0
    }
  },
  preprocess: preprocess()
};

export default config;
