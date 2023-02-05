import type { Actions } from '@sveltejs/kit';

export const actions = {
  more: async ({ fetch, locals }) => {
    return await fetch(`/repos/users?page=${locals.pagination.users.next_page || 1}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error('[ACTIONS]', reason));
  }
} as Actions;
