import { images, videos } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  videos.update(data.videos);
  images.update(data.images);
}
