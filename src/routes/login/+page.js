import { get } from 'svelte/store';
import { settings } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const token = url.searchParams.get('token');
  if (token) {
    const { lifetime } = get(settings).Session;
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
