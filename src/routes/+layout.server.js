/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
  const config = await fetch('/config')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  return { config };
}
