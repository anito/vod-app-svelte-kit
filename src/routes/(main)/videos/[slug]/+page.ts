import { get } from 'svelte/store';
import { videos } from '$lib/stores';
import type { Video } from '$lib/classes/repos/types';

export const load = async ({ fetch, params, depends }) => {
  depends('app:video');
  const id = params.slug;
  const video = get(videos).find((video: Video) => video.id === id);
  if (!video) {
    return await fetch(`/videos/${id}`).then(async (res) => {
      const { success, data: video } = await res.json();
      if (success) {
        return { video };
      } else {
        return {};
      }
    });
  }
  return {};
};
