import { get } from 'svelte/store';
import { videos } from '$lib/stores';
import type { PageLoadEvent } from './$types';
import type { Video } from '$lib/classes/repos/types';

export async function load({ fetch, params }: PageLoadEvent) {
  const id = params.slug;
  const dataExists = !!get(videos).find((video: Video) => video.id === id);
  if (!dataExists) {
    return await fetch(`/videos/${id}`).then(async (res) => {
      const { success, data } = await res.json();
      if (success) {
        return { video: data };
      }
    });
  }
  return { video: null };
}
