/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  /** @type {Object<string, any>} */
  const params = {};
  for (const [key, val] of url.searchParams) {
    params[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  return params.token ? { ...params } : {};
}
