import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { createTabSearch } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  /** @type {{user: import('$lib/types').User}} */
  const { user } = locals.session.data;
  if (user) {
    const $settings = get(settings);
    const search = createTabSearch($settings.Site.defaultUserTab);
    throw redirect(301, `/users/${user.id}${search}`);
  } else {
    throw redirect(301, `/`);
  }
}
