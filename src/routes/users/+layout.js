import { users, images, videos, videosAll } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  users.update(data.users);
  videos.update(data.videos);
  videosAll.update(data.videosAll);
  images.update(data.images);

  return {};
}
