import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { parseLifetime } from '$lib/utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'login';
  const { locale } = locals.session.data;

  if (token) {
    return await api.get(`${type}?token=${token}&locale=${locale}`).then(async (res) => {
      const locale = locals.session.data.locale;
      const getData = (/** @type {any} */ { success, data }) => {
        if (success) {
          /** @type {import('$lib/types').User} */
          const { id, name, email, avatar, jwt, role, groups } = { ...data.user, ...data };
          const lifetime = parseLifetime(get(settings).Session.lifetime);
          const _expires = new Date(Date.now() + lifetime).toISOString();
          return {
            _expires,
            user: { id, name, jwt, avatar, email },
            role,
            groups,
            locale
          };
        } else {
          return { locale };
        }
      };
      await locals.session.destroy();
      await locals.session.set(getData(res));
      return json(res);
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request, url }) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';
  const locale = locals.session.data.locale;

  return await api
    .post(`${type}?locale=${locale}`, { token: data.token, data })
    .then(async (res) => {
      const getData = (/** @type {any} */ { success, data }) => {
        if (success) {
          /** @type {import('$lib/types').User} */
          const { id, name, email, avatar, jwt, role, groups } = { ...data.user, ...data };
          const lifetime = parseLifetime(get(settings).Session.lifetime);
          const _expires = new Date(Date.now() + lifetime).toISOString();
          return {
            _expires,
            user: { id, name, email, jwt, avatar },
            role,
            groups,
            locale
          };
        } else {
          return { locale };
        }
      };
      await locals.session.destroy();
      await locals.session.set(getData(res));
      return json(res);
    });
}
