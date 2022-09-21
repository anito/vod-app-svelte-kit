import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'login';

  if (token) {
    return await api.get(`${type}`, { fetch, token }).then(async (res) => {
      if (res.success) {
        /** @type {import('$lib/types').User} */
        const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

        await locals.session.destroy();
        await locals.session.set({
          start: new Date().toISOString(),
          user: { id, name, jwt, avatar },
          role,
          groups,
          locale: get(locale)
        });
        await locals.session.refresh();
      } else {
        await locals.session.destroy();
        await locals.session.set({
          locale: get(locale)
        });
      }
      return json(res);
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request, url }) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';

  return await api.post(`${type}`, { data, fetch }).then(async (res) => {
    if (res.success) {
      /** @type {import('$lib/types').User} */
      const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

      await locals.session.destroy();
      await locals.session.set({
        start: new Date().toISOString(),
        user: { id, name, jwt, avatar },
        role,
        groups,
        locale: get(locale)
      });
      await locals.session.refresh();
    }
    return json(res);
  });
}
