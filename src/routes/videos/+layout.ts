import { videos, images } from '$lib/stores';

export async function load({ fetch }) {
  await fetch('/repos/videos')
    .then(async (res: any) => {
      if (res.ok) return await res.json();
    })
    .then((res: any) => {
      videos.update(res.videos);
    })
    .catch((reason: string) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res: any) => {
      if (res.ok) return await res.json();
    })
    .then((res: any) => {
      images.update(res.images);
    })
    .catch((reason: string) => console.error(reason));

  return {};
}
