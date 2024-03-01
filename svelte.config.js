import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import * as child_process from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(path, 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      assets: 'src/assets',
    },
    csrf: {
      checkOrigin: false,
    },
    version: {
      name: pkg.version.concat(
        ' (',
        child_process.execSync('git rev-parse --short HEAD').toString().trim(),
        ')'
      ),
    },
  },
  preprocess: preprocess(),
};

export default config;
