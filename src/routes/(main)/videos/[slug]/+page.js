import { get } from 'svelte/store';
import { videos } from '$lib/stores';

/** @type {import('./$types').PageLoad} */
export async function load({ params, data, parent, fetch }) {
  const { session } = await parent();
  const id = params.slug;
  const token = session.user?.jwt;
  const dataExists = !!get(videos).find(
    /** @param {import('$lib/types').User} user */ (user) => user.id === id
  );
  if (!dataExists && token) {
    return await fetch(`/videos/${id}`).then(async (res) => {
      const { success, data } = await res.json();
      if (success) {
        return { video: data };
      }
    });
  }
  return { video: null };
}
