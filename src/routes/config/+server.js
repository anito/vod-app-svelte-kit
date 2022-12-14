import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
  const { locale } = locals.session.data;

  return json(
    await api.get(`settings?locale=${locale}`, { fetch }).then((res) => {
      if (res?.success) {
        return res.data;
      }
      throw error(401);
    })
  );
}
