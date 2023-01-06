import { get } from 'svelte/store';
import { videos } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const id = 0; //params.slug;
  const dataExists = !!get(videos).find(
    /** @param {import('$lib/types').Video} video */ (video) => video.id === id
  );
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
