import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.get(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
}

export async function PUT({ request, params, locals }) {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.put(`users/${id}?token=${token}&locale=${locale}`, { data }).then((res) => {
    return json(res);
  });
}

export async function DELETE({ params, locals }) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
}
