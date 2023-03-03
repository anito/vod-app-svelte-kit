import type { Actions } from '@sveltejs/kit';

export const actions = {
  reload: async ({ fetch }) => {
    await fetch(`/config?/getconfig`, {
      method: 'GET'
    }).catch((reason) => console.error('[ACTIONS]', reason));
  },
  getconfig: () => {},
  mode: async ({ request, locals }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('/mode');
    await locals.session.set({ ...locals.session.data, mode });
    return { mode };
  }
} as Actions;
