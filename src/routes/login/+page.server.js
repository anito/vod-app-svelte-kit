/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const parentData = await parent();
  return { ...parentData };
}
