import { redirect } from '@sveltejs/kit';
import { users, videos, images, videosAll } from '$lib/stores';
import { USER } from '$lib/utils';

/** @type {import('./$types').PageLoad} */
export async function load({ parent, fetch, params, url }) {
  const parentData = await parent();
  const { session } = parentData;
  let notFound = false;
  if (!session.user) {
    throw redirect(301, `/`);
  }
  await fetch('/repos/users')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      if (
        !res.users.find(
          /** @param {import('$lib/types').User} usr */
          (usr) => usr.id === params.slug
        )
      ) {
        notFound = true;
      }
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

  if (notFound) {
    throw redirect(404, `/users/${session.user.id}${url.search}`);
  }
  return { session: { ...parentData.session, file: 'PageLoad /users/[slug]/+page.js' } };
}
