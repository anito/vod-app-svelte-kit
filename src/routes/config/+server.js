import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  return json(
    await api.get(`settings`, { fetch }).then((res) => {
      if (res.success) {
        return res.data;
      }
      throw error(401);
    })
  );
}
