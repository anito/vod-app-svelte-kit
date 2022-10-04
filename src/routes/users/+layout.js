/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
  const parentData = await parent();

  return { session: { ...parentData.session, file: 'LayoutLoad /users/+layout.js' } };
}
