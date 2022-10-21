import { users, videos, images } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, parent }) {
  const parentData = await parent();
  const { session } = parentData;

  await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      videos.update(res);
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      images.update(res);
    })
    .catch((reason) => console.error(reason));

  return { session: { ...session, file: 'LayoutLoad /videos/+layout.js' } };
}
