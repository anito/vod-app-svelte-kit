import { get } from 'svelte/store';
import { settings } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, parent }) {
  const token = url.searchParams.get('token');
  if (token) {
    const $settings = get(settings);
    const { lifetime } = $settings.Session;
    const res = await fetch(`/auth/login?token=${token}&lifetime=${lifetime}`);
    const response = await res.json();
    return {
      ...response,
      fromToken: true,
      file: 'PageLoad /login/+page.js'
    };
  }
  const parentData = await parent();
  return { session: { ...parentData.session } };
}
