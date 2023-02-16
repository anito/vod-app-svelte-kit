import { images, users, videos, videosAll } from '$lib/stores';
import type { LayoutLoadEvent } from './$types';

export async function load({ data }: LayoutLoadEvent) {
  users.update(data.users.data);
  videos.update(data.videos.data);
  images.update(data.images.data);
  if (data.videosAll) {
    videosAll.update(data.videosAll.data);
  } else {
    videosAll.update([]);
  }

  if (data.user) users.add([data.user]);

  return {
    pagination: data.pagination
  };
}
