import type { Actions } from '@sveltejs/kit';

export const actions = {
  more: async ({ request, fetch, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    return await fetch(`/repos/users?page=${pagination.users.next_page || 1}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
} as Actions;
