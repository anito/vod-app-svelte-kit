import { images, users, videos, videosAll } from '$lib/stores';

export const load = async ({ data }) => {
  data.users && users.update(data.users.data);
  data.user && users.add([data.user]);
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
};
