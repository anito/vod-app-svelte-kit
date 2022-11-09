import { images, derivedCurrentVideo, videoEmitter } from '$lib/stores';

/**
 * @type {import('$lib/types').Video | null}
 */
let selectedVideo;
derivedCurrentVideo.subscribe((video) => (selectedVideo = video));

/** @param {CustomEvent} ev */
export function posterCreatedHandler(ev) {
  /** @type {any} */
  let { data } = { ...ev.detail };
  if (data.length) {
    images.add(data);
    selectPoster(data[0].id);
  }
}

/** @param {CustomEvent} ev */
export function posterSelectedHandler(ev) {
  selectPoster(ev.detail);
}

export function posterRemoveHandler() {
  if (selectedVideo) {
    videoEmitter.dispatch({
      method: 'put',
      data: { id: selectedVideo.id, image_id: null, image: null },
      show: true
    });
  }
}

/** @param {string} image_id */
function selectPoster(image_id) {
  if (selectedVideo) {
    if (selectedVideo.image_id != image_id) {
      videoEmitter.dispatch({
        method: 'put',
        data: { id: selectedVideo.id, image_id, image: null },
        show: true
      });
    }
  }
}
