import * as api from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.get(`images/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
}

export async function PUT({ request, params, locals }: RequestEvent) {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api
    .put(`images/${id}?token=${token}&locale=${locale}`, { data })
    .then(async (res) => {
      return json(res);
    });
}

export async function DELETE({ params, locals }: RequestEvent) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`images/${id}?token=${token}&locale=${locale}`).then(async (res) => {
    return json(res);
  });
}
