import { images, users, videos, videosAll } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  videos.update(data.videos);
  images.update(data.images);
  users.update(data.users);
  videosAll.update(data.videosAll);

  return {};
}
