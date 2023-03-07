import { redirect } from '@sveltejs/kit';
import { ADMIN, createTabSearch, DEFAULT_TAB, SUPERUSER } from '$lib/utils';
import type { PageLoadEvent } from './$types';

export async function load({ url, parent }: PageLoadEvent) {
  const { session, config } = await parent();
  if (session.user) {
    const hasPrivileges = session.role === ADMIN || session.role === SUPERUSER;
    const tab = hasPrivileges ? config.Site.defaultadmintab : config.Site.defaultusertab;
    const search = createTabSearch(tab || DEFAULT_TAB);
    throw redirect(301, `/users/${session.user.id + search}`);
  }
  return {};
}
