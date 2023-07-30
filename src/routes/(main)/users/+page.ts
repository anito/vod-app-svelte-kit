import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { users } from '$lib/stores';
import { ADMIN, createTabSearch, DEFAULT_TAB, SUPERUSER } from '$lib/utils';

export const load = async ({ parent }) => {
  const { session, config } = await parent();
  const usersInStore = get(users);
  const firstUser = usersInStore.length ? usersInStore[0] : session.user;
  if (usersInStore.length) {
    const hasPrivileges = session.role === ADMIN || session.role === SUPERUSER;
    const tab = hasPrivileges ? config?.Site.defaultadmintab : config?.Site.defaultusertab;
    const search = createTabSearch(tab || DEFAULT_TAB);
    throw redirect(301, `/users/${firstUser?.id + search}`);
  }
  return {};
};
