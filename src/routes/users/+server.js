import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
  const data = await request.json();

  return await api.post(`users`, { data, fetch }).then(async (res) => {
    return json(res);
  });
}
