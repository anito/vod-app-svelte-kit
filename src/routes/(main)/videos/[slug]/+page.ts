import { get } from 'svelte/store';
import { videos } from '$lib/stores';
import type { PageLoadEvent } from './$types';
import type { Video } from '$lib/classes/repos/types';

export async function load({ fetch, params }: PageLoadEvent) {
  const id = params.slug;
  const video = get(videos).find((video: Video) => video.id === id);
  if (!video) {
    return await fetch(`/videos/${id}`).then(async (res) => {
      const { success, data: video } = await res.json();
      if (success) {
        return { video };
      } else {
        return { video: null };
      }
    });
  }
  return { video: null };
}
