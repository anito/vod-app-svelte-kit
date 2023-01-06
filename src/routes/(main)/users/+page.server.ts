import type { Actions } from '@sveltejs/kit';

export const actions = {
  more: async ({ request, fetch }) => {
    const data = await request.formData();
    return await fetch(`/repos/users?page=${data.get('page')}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
} as Actions;
