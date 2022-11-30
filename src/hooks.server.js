import { dev } from '$app/environment';
import { handleSession } from 'svelte-kit-cookie-session';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/classes';

export const handle = handleSession(
  {
    secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF',
    key: 'vod',
    rolling: true
  },
  async ({ event, resolve }) => {
    dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0');

    event.locals.usersRepo = UsersRepo.getInstance();
    event.locals.videosRepo = VideosRepo.getInstance();
    event.locals.imagesRepo = ImagesRepo.getInstance();
    event.locals.videosAllRepo = VideosAllRepo.getInstance();

    return await resolve(event);
  }
);

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
  return fetch(request);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event }) {
  console.log('ERROR (hooks.js)', error, event);
}
