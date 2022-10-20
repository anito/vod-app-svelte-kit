import { derived } from 'svelte/store';
import { currentVideo, videos } from './';

function createStore() {
  return derived([videos, currentVideo], ([$videos, $currentVideo], set) => {
    /** @type {import('$lib/types').Video | any} */
    const video = $videos?.find(
      /** @param {import('$lib/types').Video} video */ (video) => video.id === $currentVideo?.id
    );
    set(video);
  });
}

export default createStore();
