/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
  /**
   * @type {import('$lib/types').Video[]}
   */
  const videos = await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      return res;
    })
    .catch((reason) => console.error(reason));

  /**
   * @type {import('$lib/types').Image[]}
   */
  const images = await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      return res;
    })
    .catch((reason) => console.error(reason));

  return { videos, images };
}
