import { dev } from '$app/environment';
import { handleSession } from 'svelte-kit-cookie-session';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/repos';
import { log } from '$lib/utils';

export const handle = handleSession(
  {
    secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
  },
  async ({ event, resolve }) => {
    dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0);

    const usersRepo = UsersRepo.getInstance();
    const videosRepo = VideosRepo.getInstance();
    const imagesRepo = ImagesRepo.getInstance();
    const videosAllRepo = VideosAllRepo.getInstance();
    event.locals.usersRepo = usersRepo;
    event.locals.videosRepo = videosRepo;
    event.locals.imagesRepo = imagesRepo;
    event.locals.videosAllRepo = videosAllRepo;

    return await resolve(event);
  }
);

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
  return fetch(request);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event }) {
  log('ERROR (hooks.js)', error, event);
}
