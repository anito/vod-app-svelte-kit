// @ts-nocheck
import * as api from '$lib/api';
import { get as read } from 'svelte/store';
import { locale } from 'svelte-i18n';

export async function get({ locals, url }) {
  const token = url.searchParams.get('token');
  const lang = read(locale);
  if (token) {
    return await api
      .get(`users/login?token=${token}&locale=${lang}`, { fetch })
      .then(async (res) => {
        if (res.success) {
          const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

          await locals.session.destroy();
          await locals.session.set({
            user: { id, name, jwt, avatar },
            role,
            groups,
            locale: lang
          });
          await locals.session.refresh();
          return {
            status: 200,
            body: { ...res }
          };
        }
        return {
          status: 401,
          body: { ...res }
        };
      });
  }
  return {
    status: 401
  };
}

export async function post({ locals, request, url }) {
  const token = url.searchParams.get('token');
  const data = await request.json();
  const lang = read(locale);

  return await api.post(`users/login?locale=${lang}`, { data, fetch }).then(async (res) => {
    if (res.success) {
      const { id, name, avatar, jwt, role, groups } = { ...res.data.user, ...res.data };

      await locals.session.destroy();
      await locals.session.set({
        user: { id, name, jwt, avatar },
        role,
        groups,
        locale: lang
      });
      await locals.session.refresh();
      return {
        body: { ...res }
      };
    }
    return {
      status: 401,
      body: { ...res }
    };
  });
}
