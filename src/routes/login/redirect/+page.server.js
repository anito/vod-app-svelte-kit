/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  /** @type {Object<string, any>} */

  return params.token ? { ...params } : {};
}
