import type { HandleClientError } from '@sveltejs/kit';

export const handleError = (({ error, event }) => {
  return {
    message: 'An error occured!',
    code: error ?? 'UNKNOWN'
  };
}) satisfies HandleClientError;
