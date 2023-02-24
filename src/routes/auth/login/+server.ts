import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { parseLifetime } from '$lib/utils';
import type { User } from '$lib/classes/repos/types';
import type { RequestEvent } from './$types';

const parseData = (data: any, lifetime: number) => {
  const { id, name, email, avatar, jwt, role, groups }: User = { ...data.user, ...data };
  lifetime = parseLifetime(lifetime);
  const _expires = new Date(Date.now() + lifetime).toISOString();
  return {
    _expires,
    user: { id, name, email, jwt, avatar },
    role,
    groups
  };
};

export async function GET({ locals, url }: RequestEvent) {
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'login';
  const locale = locals.session.data.locale;

  if (token) {
    return await api.get(`${type}?token=${token}&locale=${locale}`).then(async (res) => {
      const lifetime = Number(locals.config.Session?.lifetime);
      await locals.session.destroy();
      if (res.success) {
        await locals.session.set({ ...parseData(res.data, lifetime), locale });
      }
      return json(res);
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

export async function POST({ locals, request, url }: RequestEvent) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';
  const locale = locals.session.data.locale;

  return await api
    .post(`${type}?locale=${locale}`, { token: data.token, data })
    .then(async (res) => {
      await locals.session.destroy();
      if (res.success) {
        const lifetime = Number(locals.config.Session?.lifetime);
        await locals.session.set({ ...parseData(res.data, lifetime), locale });
      }
      return json(res);
    });
}
