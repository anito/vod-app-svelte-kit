import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { createTabSearch } from '$lib/utils';
import type { PageLoadEvent } from './$types';

export async function load({ parent }: PageLoadEvent) {
  const { session } = await parent();
  if (session.user) {
    const $settings = get(settings);
    const search = createTabSearch($settings.Site.defaultUserTab);
    throw redirect(301, `/users/${session.user.id}${search}`);
  }
  return {};
}
