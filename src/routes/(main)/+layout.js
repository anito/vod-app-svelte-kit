import { images, users, videos, videosAll } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  users.update(data.users.data);
  videos.update(data.videos.data);
  images.update(data.images.data);
  videosAll.update(data.videosAll.data);

  users.add([data.user]);

  return {
    pagination: {
      users: data.users.pagination,
      videos: data.videos.pagination,
      images: data.images.pagination
    }
  };
}
