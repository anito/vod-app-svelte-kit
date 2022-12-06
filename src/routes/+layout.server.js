/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch, depends, locals }) {
  /**
   * @type {import('$lib/types').Session}
   */
  const session = await fetch('/session')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  const repos = locals.repos;

  depends('app:session');

  return { session, repos };
}
