import { get } from 'svelte/store';
import { videos } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, setHeaders }) {
  const id = params.slug;
  const dataExists = !!get(videos).find(
    /** @param {import('$lib/types').Video} video */ (video) => video.id === id
  );
  if (!dataExists) {
    setHeaders({
      age: '1000000',
      'cache-control': '10000000'
    });
    return await fetch(`/videos/${id}`).then(async (res) => {
      const { success, data } = await res.json();
      if (success) {
        return { video: data };
      }
    });
  }
  return { video: null };
}
