import { videos, images } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, parent }) {
  const parentData = await parent();
  await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      videos.update(res.videos);
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      images.update(res.images);
    })
    .catch((reason) => console.error(reason));

  return { session: { ...parentData.session, file: 'LayoutLoad /videos/+layout.js' } };
}
