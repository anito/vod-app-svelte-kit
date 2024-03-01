import { dev } from '$app/environment';
import * as api from '$lib/api';
import { DEFAULT_CONFIG } from '$lib/utils/const';
import { handleSession } from 'svelte-kit-cookie-session';
import { parseLifetime } from '$lib/utils';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/classes';
import type { HandleFetch, HandleServerError } from '@sveltejs/kit';
import type { Config } from '$lib/types';

dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0');

const getConfig: () => Promise<Config> = async () => {
  const res = await api.get(`settings`);
  if (res?.success) {
    return { ...DEFAULT_CONFIG, ...res.data };
  }
  return DEFAULT_CONFIG;
};

const killOrExtend = async (locals: App.Locals) => {
  const isExpired = new Date() > new Date(locals.session.data._expires);
  if (isExpired) {
    const locale = locals.session.data.locale;
    await locals.session.destroy();
    if (locale) await locals.session.set({ locale });
  } else {
    if (config && locals.session.data.user) {
      const _expires = new Date(
        Date.now() + parseLifetime(config.Session.lifetime)
      ).toISOString();
      await locals.session.update(() => ({ _expires }));
    }
  }
};

let config: Config | null = await getConfig();

export const handle = handleSession(
  {
    secret: 'kqAGZ*h?A?0wk#@]pGePo4AMedc#iG75',
    key: 'VOD__APP__SESSION',
    rolling: true,
    expires: 60 * 60 * 24, //parseInt(config.Session.lifetime),
    expires_in: 'seconds',
  },
  async ({ event, resolve }) => {
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
      pagination: JSON.parse(event.cookies.get('pagination') || '{}'),
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
