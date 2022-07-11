// @ts-nocheck
import { images, currentVideo, videoEmitter } from '../stores';

let selectedVideo;
currentVideo.subscribe((video) => (selectedVideo = video));

export function posterCreatedHandler(e) {
	let { data } = { ...e.detail };
	let newPosterId = data.length && data[0].id;
	if (newPosterId) {
		images.add(data);
		selectPoster(newPosterId);
	}
}

export function posterSelectedHandler(e) {
	selectPoster(e.detail);
}

export function posterRemoveHandler() {
	if (selectedVideo) {
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
		selectedVideo.image_id != id &&
			(selectedVideo.image_id = id) &&
			videoEmitter.dispatch({
				method: 'put',
				data: selectedVideo,
				show: true
			});
	}
}
