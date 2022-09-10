import { users, videos, images, videosAll } from '$lib/stores';
import { USER } from '$lib/utils';

export async function load({ parent, fetch }) {
  const parentData = await parent();
  const { session } = parentData;
  await fetch('/repos/users')
    .then(async (res: any) => {
      if (res.ok) return await res.json();
    })
    .then((res: any) => {
      users.update(res.users);
    })
    .catch((reason: any) => console.error(reason));

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

  if (session.role === USER) {
    await fetch('/repos/videos/all')
      .then(async (res: any) => {
        if (res.ok) return await res.json();
      })
      .then((res: any) => {
        videosAll.update(res.videos);
      })
      .catch((reason: string) => console.error(reason));
  }

  return {};
}
