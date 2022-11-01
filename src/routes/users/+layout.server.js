import { USER } from '$lib/utils';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch, locals, depends }) {
  const { role } = locals.session.data;

  const users = await fetch('/repos/users')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const videos = await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const images = await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const videosAll =
    (role === USER &&
      (await fetch('/repos/videos/all')
        .then(async (res) => {
          if (res.ok) return await res.json();
        })
        .catch((reason) => console.error(reason)))) ||
    [];

  depends('app:repos');

  return { users, videos, images, videosAll };
}
