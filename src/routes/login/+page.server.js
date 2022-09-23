/** @type {import('./$types').PageLoad} */
export async function _load({ parent }) {
  const parentData = await parent();
  return { ...parentData, test: true };
}
