import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals }) {
  const { locale } = locals.session.data;
  await locals.session.destroy();
  // re-save locale to session
  await locals.session.set({ locale });

  return await api.post(`users/logout?locale=${locale}`).then((res) => {
    return json({
      ...res
    });
  });
}
