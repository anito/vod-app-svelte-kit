import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { parseLifetime } from '$lib/utils';
import type { User } from '$lib/classes/repos/types';
import type { RequestEvent } from './$types';

const parseData = ({ success, data }: any) => {
  if (success) {
    const { id, name, email, avatar, jwt, role, groups }: User = { ...data.user, ...data };
    const lifetime = parseLifetime(get(settings).Session.lifetime);
    const _expires = new Date(Date.now() + lifetime).toISOString();
    return {
      _expires,
      user: { id, name, email, jwt, avatar },
      role,
      groups
    };
  } else {
    return {};
  }
};

export async function GET({ locals, url, cookies }: RequestEvent) {
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type') || 'login';
  const { locale } = locals.session.data;

  if (token) {
    return await api.get(`${type}?token=${token}&locale=${locale}`).then(async (res) => {
      await locals.session.destroy();
      await locals.session.set({ ...parseData(res), locale });
      return json(res);
    });
  }
  throw error(401, 'This method is only allowed for token logins');
}

export async function POST({ locals, request, url, cookies }: RequestEvent) {
  const data = await request.json();
  const type = url.searchParams.get('type') || 'login';
  const { locale } = locals.session.data;

  return await api
    .post(`${type}?locale=${locale}`, { token: data.token, data })
    .then(async (res) => {
      await locals.session.destroy();
      await locals.session.set({ ...parseData(res), locale });
      return json(res);
    });
}
