/** @type {import('./$types').LayoutLoad} */
export async function load({ depends, parent }) {
  const parentData = await parent();

  depends('/session');

  return { session: { ...parentData.session, file: 'LayoutLoad /users/+layout.js' } };
}
