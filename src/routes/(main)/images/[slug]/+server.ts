import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

export const GET = async ({ params, locals }) => {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.get(`images/${id}?token=${token}&locale=${locale}`).then((res) => {
    return json(res);
  });
};

export const PUT = async ({ request, params, locals }) => {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api
    .put(`images/${id}?token=${token}&locale=${locale}`, { data })
    .then(async (res) => {
      return json(res);
    });
};

export const DELETE = async ({ params, locals }) => {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`images/${id}?token=${token}&locale=${locale}`).then(async (res) => {
    return json(res);
  });
};
