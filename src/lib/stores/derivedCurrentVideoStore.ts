import { derived } from 'svelte/store';
import { currentVideo, videos } from '.';

export default derived([videos, currentVideo], ([$videos, $currentVideo], set) => {
  const video = $videos.find((video) => video.id === $currentVideo?.id);
  video && set(video);
});
