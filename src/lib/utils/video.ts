import { images } from '$lib/stores';
import { dispatch } from './helper';

export function posterCreatedHandler({ detail }: CustomEvent, video_id: string) {
  const { data }: any = { ...detail.responseText };
  if (data.length) {
    images.add(data);
    selectPoster(data[0].id, video_id);
  }
}

export function posterSelectedHandler(image_id: any, video_id: any) {
  selectPoster(image_id, video_id);
}

export function posterRemoveHandler(id: any) {
  if (id) {
    dispatch('video:save', { data: { id, image_id: null, image: null }, show: true });
  }
}

function selectPoster(image_id: any, video_id: string) {
  if (video_id) {
    dispatch('video:save', { data: { id: video_id, image_id, image: null }, show: true });
  }
}
