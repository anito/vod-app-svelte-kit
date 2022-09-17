import { redirect } from '@sveltejs/kit';
import { createTabSearch } from '$lib/utils';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const parentData = await parent();
  const { config, session } = parentData;
  if (session.user) {
    const search = createTabSearch(config.Site.defaultUserTab);
    throw redirect(301, `/users/${session.user.id}${search}`);
  } else {
    throw redirect(301, `/`);
  }
}
