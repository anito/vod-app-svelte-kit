import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, locals }) {
  const data = await request.json();
  const token = locals.session.data.user?.jwt;

  return await api.post('users', { data, token }).then(async (res) => {
    return json(res);
  });
}
