import { USER } from '$lib/utils';
import type { LayoutServerLoadEvent } from './$types';

export async function load({ fetch, depends, locals }: LayoutServerLoadEvent) {
  const { role, user: sessionUser } = locals.session.data;

  const videos = await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => res)
    .catch((reason) => console.error(reason));

  const images = await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const users = await fetch(`/repos/users`)
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const user =
    (sessionUser &&
      (await fetch(`/repos/users?id=${sessionUser?.id}`)
        .then(async (res) => {
          if (res.ok) return await res.json();
        })
        .catch((reason) => console.error(reason)))) ||
    null;

  const videosAll =
    (role === USER &&
      (await fetch('/repos/videos/all')
        .then(async (res) => {
          if (res.ok) {
            return await res.json();
          }
        })
        .catch((reason) => console.error(reason)))) ||
    [];

  depends('app:main');

  return {
    user,
    users,
    videos,
    images,
    videosAll
  };
}
