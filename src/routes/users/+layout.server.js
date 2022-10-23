import { USER } from '$lib/utils';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent, fetch, locals }) {
  const { role } = locals.session.data;

  let users;
  let images;
  let videos;
  let videosAll;

  await fetch('/repos/users')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      users = res;
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      videos = res;
    })
    .catch((reason) => console.error(reason));

  await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      images = res;
    })
    .catch((reason) => console.error(reason));

  if (role === USER) {
    await fetch('/repos/videos/all')
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .then((res) => {
        videosAll = res;
      })
      .catch((reason) => console.error(reason));
  } else {
    videosAll = [];
  }

  return { users, videos, images, videosAll };
}
