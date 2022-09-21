import { searchParamsToObject } from '$lib/utils';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, data }) {
  const { token } = searchParamsToObject(url.searchParams);
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      return { ...response.data, token: true };
    });
  }
  return { ...data };
}
