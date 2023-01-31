import type { Actions } from '@sveltejs/kit';

export const actions = {
  more_videos: async ({ request, fetch, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    return await fetch(`/repos/videos?page=${pagination.videos.next_page}`)
      .then(async (res) => {
        if (res.ok) {
          return await res.json();
        }
      })
      .catch((reason) => console.error(reason));
  },
  more_videos_all: async ({ request, fetch, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    return await fetch(`/repos/videos/all?page=${pagination.videosAll.next_page}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  },
  more_images: async ({ request, fetch, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    return await fetch(`/repos/images?page=${pagination.images.next_page}`)
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .catch((reason) => console.error(reason));
  }
} as Actions;
