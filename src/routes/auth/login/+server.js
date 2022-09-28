import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { locale as i18n } from 'svelte-i18n';
import { settings } from '$lib/stores';

/** @type {number | any} */
let lifetime;
settings.subscribe((val) => (lifetime = val.Session.lifetime));

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
  const token = url.searchParams.get('token');

  if (token) {
    return await api.get('login', { fetch, token }).then(async (res) => {
      const locale = locals.session.data.locale || get(i18n);
      const success = res.success;
      const { renewed, message } = res.data;
      let cookieData;
      if (success) {
        /** @type {import('$lib/types').User} */
        const { id, name, email, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };
        cookieData = {
          _expires: new Date(Date.now() + parseInt(lifetime)).toISOString(),
          user: { id, name, jwt, avatar, email },
          role,
          groups,
          locale
        };
      } else {
        cookieData = { locale };
      }
      await locals.session.destroy();
      await locals.session.set(cookieData);
      return json({ ...cookieData });
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request, url }) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';

  return await api.post(`${type}`, { token: data.token, data, fetch }).then(async (res) => {
    const locale = locals.session.data.locale || get(i18n);
    let cookieData;
    if (res.success) {
      /** @type {import('$lib/types').User} */
      const { id, name, email, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };
      cookieData = {
        _expires: new Date(Date.now() + parseInt(lifetime)).toISOString(),
        user: { id, name, email, jwt, avatar },
        role,
        groups,
        locale
      };
    } else {
      cookieData = { locale };
    }
    await locals.session.destroy();
    await locals.session.set(cookieData);
    return json(res);
  });
}
