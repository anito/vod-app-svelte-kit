import { redirect } from '@sveltejs/kit';
import { createTabSearch } from '$lib/utils';
import type { PageLoadEvent } from './$types';

export async function load({ url, parent }: PageLoadEvent) {
  const { session, config } = await parent();
  if (session.user) {
    const search = createTabSearch(config.Site.defaultAdminTab);
    throw redirect(301, `/users/${session.user.id + search}`);
  }
  return {};
}
