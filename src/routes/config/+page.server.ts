import type { Actions } from '@sveltejs/kit';

export const actions = {
  reload: async ({ fetch, locals }) => {
    return await fetch(`/config`, {
      method: 'GET'
    })
      .then(async (res) => await res.json())
      .then((res) => (locals.config = res))
      .catch((reason) => console.error('[ACTIONS]', reason));
  },
  mode: async ({ request, locals }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('/mode');
    await locals.session.set({ ...locals.session.data, mode });
    return { mode };
  }
} as Actions;
