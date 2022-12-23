import { get } from 'svelte/store';
import { users } from '$lib/stores';
import { ADMIN, SUPERUSER } from '$lib/utils';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, parent }) {
  const parentData = await parent();
  const { role } = parentData.session;
  const hasPrivileges = role === SUPERUSER || role === ADMIN;

  // load the user in question (from url)
  // if user rights permit
  if (hasPrivileges) {
    /**
     * @type {never[]}
     */
    const $users = get(users);
    const id = params.slug;
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
  }
  return { user: null };
}
