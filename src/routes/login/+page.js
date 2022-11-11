import { get } from 'svelte/store';
import { settings } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, parent }) {
  const parentData = await parent();
  const token = url.searchParams.get('token');
  if (token) {
    const $settings = get(settings);
    const { lifetime } = $settings.Session;
    return await fetch(`/auth/login?token=${token}&lifetime=${lifetime}`).then(async (res) => {
      const response = await res.json();
      return {
        ...response,
        fromToken: true
      };
    });
  }
  return {};
}
