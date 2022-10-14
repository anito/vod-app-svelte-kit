import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { createTabSearch } from '$lib/utils';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const parentData = await parent();
  const { session } = parentData;
  if (session.user) {
    const $settings = get(settings);
    const search = createTabSearch($settings.Site.defaultUserTab);
    throw redirect(301, `/users/${session.user.id}${search}`);
  } else {
    throw redirect(301, `/`);
  }
}
