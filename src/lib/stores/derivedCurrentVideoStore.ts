import { derived } from 'svelte/store';
import { currentVideo, videos } from '.';

function createStore() {
  return derived([videos, currentVideo], ([$videos, $currentVideo], set) => {
    const video = $videos.find((video) => video.id === $currentVideo?.id);
    video && set(video);
  });
}

export default createStore();
