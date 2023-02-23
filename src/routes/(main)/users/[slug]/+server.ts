import * as api from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  console.log('fetching user...');
  return await api.get(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
}

export async function PUT({ request, params, locals }: RequestEvent) {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.put(`users/${id}?token=${token}&locale=${locale}`, { data }).then((res) => {
    return json(res);
  });
}

export async function DELETE({ params, locals }: RequestEvent) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
}
