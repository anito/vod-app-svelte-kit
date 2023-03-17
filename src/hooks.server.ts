import { dev } from '$app/environment';
import * as api from '$lib/api';
import { handleSession } from 'svelte-kit-cookie-session';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/classes';
import type { HandleFetch, HandleServerError } from '@sveltejs/kit';
import type { Config } from '$lib/types';

async function getConfig(): Promise<any> {
  const res = await api.get(`settings`);
  return res?.success ? { ...res.data } : {};
}

let config: Config | null = null;

export const handle = handleSession(
  {
    secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF',
    key: 'VOD__SESSION',
    rolling: true
  },
  async ({ event, resolve }) => {
    dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0');

    // Force config to reload
    if (
      event.url.pathname.startsWith('/config') &&
      event.url.searchParams.get('/reload') === 'true'
    ) {
      config = null;
    }
    event.locals = {
      ...event.locals, // session
      config: config || (config = await getConfig()),
      usersRepo: UsersRepo.getInstance(),
      videosRepo: VideosRepo.getInstance(),
      videosAllRepo: VideosAllRepo.getInstance(),
      imagesRepo: ImagesRepo.getInstance(),
      userAgent: event.request.headers.get('user-agent'),
      pagination: JSON.parse(event.cookies.get('pagination') || '{}')
    };

    return await resolve(event);
  }
);

export const handleFetch = (({ request, fetch }) => {
  return fetch(request);
}) satisfies HandleFetch;

export const handleError = (({ error, event }) => {
  console.log('ERROR (hooks.js)', error, event);
}) satisfies HandleServerError;
