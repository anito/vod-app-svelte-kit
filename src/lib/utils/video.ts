import { images } from '$lib/stores';
import { emit } from './helper';

export function posterCreatedHandler({ detail }: CustomEvent, video_id: string) {
  const { data }: any = { ...detail.responseText };
  if (data.length) {
    images.add(data);
    savePoster(data[0].id, video_id);
  }
}

export function posterSaveHandler(image_id: string, video_id: string) {
  savePoster(image_id, video_id);
}

export function posterRemoveHandler(id: string) {
  if (id) {
    emit('video:save', { data: { id, image_id: null, image: null }, show: true });
  }
}

function savePoster(image_id: string, video_id: string) {
  emit('video:save', { data: { id: video_id, image_id, image: null }, show: true });
  emit('video:poster:changed', { video_id, image_id });
}
