// @ts-nocheck
import { images, currentVideo, videoEmitter } from '../stores';

let selectedVideo;
currentVideo.subscribe((video) => (selectedVideo = video));

export function posterCreatedHandler(e) {
  let { data } = { ...e.detail };
  if (data.length) {
    images.add(data);
    selectPoster(data[0].id);
  }
}

export function posterSelectedHandler(e) {
  selectPoster(e.detail);
}

export function posterRemoveHandler() {
  if (selectedVideo) {
    selectedVideo.image = null;
    selectedVideo.image_id = null;
    videoEmitter.dispatch({
      method: 'put',
      data: selectedVideo,
      show: true
    });
  }
}

function selectPoster(id) {
  if (selectedVideo) {
    if (selectedVideo.image_id != id) {
      selectedVideo.image = null;
      selectedVideo.image_id = id;
      videoEmitter.dispatch({
        method: 'put',
        data: selectedVideo,
        show: true
      });
    }
  }
}
