import { get } from 'svelte/store';
import { users } from '$lib/stores';
import { ADMIN, SUPERUSER } from '$lib/utils';
import type { PageLoadEvent } from './$types';
import type { User } from '$lib/classes/repos/types';

export async function load({ params, fetch, parent, setHeaders }: PageLoadEvent) {
  const parentData = await parent();
  const role = parentData.session.role;
  const hasPrivileges = role === SUPERUSER || role === ADMIN;

  // load the user in question (from url)
  // if user rights permit
  if (hasPrivileges) {
    const $users = get(users);
    const id = params.slug;
    const dataExists = !!$users.find((user: User) => user.id === id);
    if (!dataExists) {
      return await fetch(`/users/${id}`).then(async (res) => {
        setHeaders({
          age: '1000000',
          'cache-control': '10000000'
        });
        const { success, data } = await res.json();
        if (success) {
          return { user: data };
        }
      });
    }
  }
  return { user: null };
}
