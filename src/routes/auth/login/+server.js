import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
  const token = url.searchParams.get('token');
  const lang = get(locale);
  if (token) {
    return await api
      .get(`users/login?token=${token}&locale=${lang}`, { fetch })
      .then(async (res) => {
        if (res.success) {
          const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

          await locals.session.destroy();
          await locals.session.set({
            start: new Date().toISOString(),
            user: { id, name, jwt, avatar },
            role,
            groups,
            locale: lang
          });
          await locals.session.refresh();
        }
        return json({ ...res });
      });
  }
  throw error(401, 'This method is only allowed for token logins');
}

export async function POST({ locals, request }) {
  const data = await request.json();
  const lang = get(locale);

  return await api.post(`users/login?locale=${lang}`, { data, fetch }).then(async (res) => {
    if (res.success) {
      const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

      await locals.session.destroy();
      await locals.session.set({
        start: new Date().toISOString(),
        user: { id, name, jwt, avatar },
        role,
        groups,
        locale: lang
      });
      await locals.session.refresh();
    }
    return json({ ...res });
  });
}
