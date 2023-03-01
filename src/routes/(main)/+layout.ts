import { images, users, videos, videosAll } from '$lib/stores';
import type { LayoutLoadEvent } from './$types';

export async function load({ data }: LayoutLoadEvent) {
  data.user && users.add([data.user]);
  data.users && users.update(data.users.data);
  data.videos && videos.update(data.videos.data);
  data.images && images.update(data.images.data);
  if (data.videosAll) {
    videosAll.update(data.videosAll.data);
  } else {
    videosAll.update([]);
  }

  return {
    pagination: data.pagination
  };
}
