import type { Actions } from '@sveltejs/kit';

export const actions = {
  reload: async ({ fetch }) => {
    /**
     * This is a virtual path that does not exist anywhere.
     * Its only purpose is to tell the server hook to reset config variable
     * which in turn forces configuration data to reload
     */
    await fetch(`/?/resetconfig`, {
      method: 'GET'
    }).catch((reason) => console.error('[ACTIONS]', reason));
  }
} as Actions;
