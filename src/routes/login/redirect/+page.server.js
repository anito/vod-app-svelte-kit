import { searchParamsToObject } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const params = searchParamsToObject(url.searchParams);
  return params.token ? { ...params } : {};
}
