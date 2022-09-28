import { log } from '$lib/utils';

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
  return {
    message: 'An error occured!',
    code: error.code ?? 'UNKNOWN'
  };
}
