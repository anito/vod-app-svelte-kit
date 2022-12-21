import { get } from 'svelte/store';
import { users } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ params, data, parent, fetch }) {
  const id = params.slug;
  /**
   * @type {never[]}
   */
  const $users = get(users);
  const dataExists = !!$users.find(
    /** @param {import('$lib/types').User} user */ (user) => user.id === id
  );
  if (!dataExists) {
    return await fetch(`/users/${id}`).then(async (res) => {
      const { success, data } = await res.json();
      if (success) {
        return { user: data };
      }
    });
  }
  return { user: null };
}
