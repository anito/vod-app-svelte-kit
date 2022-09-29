import { redirect } from '@sveltejs/kit';
import { createTabSearch } from '$lib/utils';
import { settings } from '$lib/stores';

/** @type {import('$lib/types').Setting} */
let config;
settings.subscribe((val) => (config = val));

/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {
  const parentData = await parent();
  const { session } = parentData;
  if (session.user) {
    const search = createTabSearch(config.Site.defaultUserTab);
    throw redirect(301, `/users/${session.user.id}${search}`);
  } else {
    throw redirect(301, `/`);
  }
}
