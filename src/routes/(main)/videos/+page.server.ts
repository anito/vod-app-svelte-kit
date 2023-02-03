import type { Actions } from '@sveltejs/kit';

export const actions = {
  more_videos: async ({ fetch, locals }) => {
    return await fetch(`/repos/videos?page=${locals.pagination.videos.next_page || 1}`)
      .then(async (res) => {
        if (res.ok) {
          return await res.json();
        }
      })
      .catch((reason) => console.error(reason));
  },
  more_videos_all: async ({ fetch, locals }) => {
    return await fetch(`/repos/videos/all?page=${locals.pagination.videosAll.next_page || 1}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  },
  more_images: async ({ fetch, locals }) => {
    return await fetch(`/repos/images?page=${locals.pagination.images.next_page || 1}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
} as Actions;
