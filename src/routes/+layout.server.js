/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch, depends }) {
  const session = await fetch('/session')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  depends('app:session');

  return { session };
}
