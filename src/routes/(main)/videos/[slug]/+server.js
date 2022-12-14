import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET() {
  return json({});
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ request, params, locals }) {
  const data = await request.json();
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api
    .put(`videos/${id}?token=${token}&locale=${locale}`, { data })
    .then(async (res) => {
      return json(res);
    });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ params, locals }) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.del(`videos/${id}?token=${token}&locale=${locale}`).then(async (res) => {
    return json(res);
  });
}
