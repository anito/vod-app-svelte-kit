import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ request, params }) {
  const data = await request.json();
  const id = params.slug;

  return await api.put(`users/${id}`, { data, fetch }).then(async (res) => {
    return json(res);
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ request, params }) {
  const data = await request.json();
  const id = params.slug;

  return await api.del(`users/${id}`, { data, fetch }).then(async (res) => {
    return json(res);
  });
}
