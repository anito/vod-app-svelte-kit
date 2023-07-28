import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { parseLifetime, randomItem } from '$lib/utils';
import type { User } from '$lib/classes/repos/types';
import type { LoginResponseData } from '$lib/types';

const parseData = (data: LoginResponseData) => {
  const { id, name, email, avatar, jwt, role, groups }: User = { ...data.user, ...data };
  return {
    user: { id, name, email, jwt, avatar, role },
    role,
    groups
  };
};

const setSession = async (locals: App.Locals, data: LoginResponseData) => {
  const salutations = locals.config.Site?.salutations;
  const lifetime = Number(locals.config.Session?.lifetime);
  const _expires = new Date(Date.now() + parseLifetime(lifetime)).toISOString();
  const locale = locals.session.data.locale;

  await locals.session.destroy();

  await locals.session.set({
    ...parseData(data),
    _expires,
    salutation: randomItem(salutations),
    locale
  });
};

export async function GET({ locals, url }) {
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'login';
  const locale = locals.session.data.locale;

  if (token) {
    return await api.get(`${type}?token=${token}&locale=${locale}`).then(async (res) => {
      await locals.session.destroy();
      if (res.success) await setSession(locals, res.data);
      return json(res);
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

export async function POST({ locals, request, url }) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';
  const locale = locals.session.data.locale;

  return await api
    .post(`${type}?locale=${locale}`, { token: data.token, data })
    .then(async (res) => {
      if (res.success) await setSession(locals, res.data);
      return json(res);
    });
}
