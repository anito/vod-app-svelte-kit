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
  const token = locals.session.data.user?.jwt;

  return await api.put(`users/${id}?token=${token}`, { data }).then(async (res) => {
    return json(res);
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ params, locals }) {
  const id = params.slug;
  const token = locals.session.data.user?.jwt;

  return await api.del(`users/${id}?token=${token}`).then(async (res) => {
    return json(res);
  });
}
