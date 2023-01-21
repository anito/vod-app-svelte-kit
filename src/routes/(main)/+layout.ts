import { images, users, videos, videosAll } from '$lib/stores';
import type { LayoutLoadEvent } from './$types';

export async function load({ data, depends }: LayoutLoadEvent) {
  users.update(data.users.data);
  videos.update(data.videos.data);
  images.update(data.images.data);
  videosAll.update(data.videosAll.data);

  if (data.user) users.add([data.user]);

  depends('app:pagination');

  return {
    pagination: {
      users: data.users.pagination,
      videos: data.videos.pagination,
      videosAll: data.videosAll.pagination,
      images: data.images.pagination
    }
  };
}