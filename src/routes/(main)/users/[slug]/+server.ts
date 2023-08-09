import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

export const GET = async ({ params, locals }) => {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.get(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
};

export const PUT = async ({ request, params, locals }) => {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.put(`users/${id}?token=${token}&locale=${locale}`, { data }).then((res) => {
    return json(res);
  });
};

export const DELETE = async ({ params, locals }) => {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`users/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
};
