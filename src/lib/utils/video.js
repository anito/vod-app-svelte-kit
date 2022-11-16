import { images, videoEmitter } from '$lib/stores';

/**
 * @param {CustomEvent} event
 * @param {string} video_id
 **/
export function posterCreatedHandler({ detail }, video_id) {
  /** @type {any} */
  let { data } = { ...detail.responseText };
  if (data.length) {
    images.add(data);
    selectPoster(data[0].id, video_id);
  }
}

/**
 * @param {string} image_id
 * @param {string} video_id
 **/
export function posterSelectedHandler(image_id, video_id) {
  selectPoster(image_id, video_id);
}

/**
 *
 * @param {string} id
 */
export function posterRemoveHandler(id) {
  if (id) {
    videoEmitter.dispatch({
      method: 'put',
      data: { id, image_id: null, image: null },
      show: true
    });
  }
}

/**
 *
 * @param {string} image_id
 * @param {string} video_id
 */
function selectPoster(image_id, video_id) {
  if (video_id) {
    videoEmitter.dispatch({
      method: 'put',
      data: { id: video_id, image_id, image: null },
      show: true
    });
  }
}
