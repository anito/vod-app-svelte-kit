import { images, users, videos, videosAll } from '$lib/stores';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  users.update(data.users.data);
  videos.update(data.videos.data);
  images.update(data.images.data);
  videosAll.update(data.videosAll.data);

  if (data.user) users.add([data.user]);

  return {
    pagination: {
      users: data.users.pagination,
      videos: data.videos.pagination,
      videosAll: data.videosAll.pagination,
      images: data.images.pagination
    }
  };
}
