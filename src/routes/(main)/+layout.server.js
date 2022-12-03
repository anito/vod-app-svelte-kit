import { USER } from '$lib/utils';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch, depends, locals }) {
  /**
   * @type {import('$lib/types').Video[]}
   */
  const videos = await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  /**
   * @type {import('$lib/types').Image[]}
   */
  const images = await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  /**
   * @type {import('$lib/types').User[]}
   */
  const users = await fetch(`/repos/users`)
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const { role } = locals.session.data;
  /**
   * @type {import('$lib/types').VideoAll[]}
   */
  const videosAll =
    (role === USER &&
      (await fetch('/repos/videos/all')
        .then(async (res) => {
          if (res.ok) return await res.json();
        })
        .catch((reason) => console.error(reason)))) ||
    [];
  depends('app:main');

  return { users, videos, images, videosAll };
}
