/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch }) {
  let images;
  let videos;

  await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      videos = res;
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      images = res;
    })
    .catch((reason) => console.error(reason));

  return { videos, images };
}
