/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
  const token = url.searchParams.get('token');
  return token ? { token } : {};
}
