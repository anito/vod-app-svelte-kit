import { dev } from '$app/environment';
import * as api from '$lib/api';
import { DEFAULT_CONFIG } from '$lib/utils/const';
import { handleSession } from 'svelte-kit-cookie-session';
import { parseLifetime } from '$lib/utils';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/classes';
import type { HandleFetch, HandleServerError } from '@sveltejs/kit';
import type { Config } from '$lib/types';

const getConfig = async () => {
  const res = await api.get(`settings`);
  if (res?.success) {
    return { ...DEFAULT_CONFIG, ...res.data };
  }
};

const killOrExtend = async (locals: App.Locals) => {
  const isExpired = new Date() > new Date(locals.session.data._expires);
  if (isExpired) {
    const locale = locals.session.data.locale;
    await locals.session.destroy();
    if (locale) await locals.session.set({ locale });
  } else {
    if (config && locals.session.data.user) {
      const _expires = new Date(Date.now() + parseLifetime(config.Session.lifetime)).toISOString();
      await locals.session.update(() => ({ _expires }));
    }
  }
};

let config: Config | null = null;

export const handle = handleSession(
  {
    secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF',
    key: 'VOD__SESSION',
    rolling: true
  },
  async ({ event, resolve }) => {
    dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0');

    if (event.url.pathname.startsWith('/users')) {
      console.log('has user in path ->', event.url.pathname);
    }

    // Force config to reload
    if (
      event.url.pathname.startsWith('/config') &&
      event.url.searchParams.get('/reload') === 'true'
    ) {
      config = null;
    }

    config = config || (await getConfig());
    await killOrExtend(event.locals);

    event.locals = {
      ...event.locals, // session
      config,
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
