import * as api from '$lib/api.js';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals }) {
  const locale = locals.session.data.locale;
  await locals.session.destroy();
  // re-save locale to session
  if (locale) {
    await locals.session.set({ locale });
  }

  return await api.post('users/logout').then((res) => {
    return json({
      ...res
    });
  });
}
