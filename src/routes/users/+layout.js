import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { users, videos, images, videosAll } from '$lib/stores';
import { USER } from '$lib/utils';

/** @type {import('./$types').LayoutLoad} */
export async function load({ parent, fetch }) {
  const parentData = await parent();
  const { session } = parentData;

  await fetch('/repos/users')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      users.update(res.users);
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      videos.update(res.videos);
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      images.update(res.images);
    })
    .catch((reason) => console.error(reason));

  if (session.role === USER) {
    await fetch('/repos/videos/all')
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .then((res) => {
        videosAll.update(res.videos);
      })
      .catch((reason) => console.error(reason));
  }

  return { session: { ...parentData.session, file: 'LayoutLoad /+layout.js' }, users: get(users) };
}
