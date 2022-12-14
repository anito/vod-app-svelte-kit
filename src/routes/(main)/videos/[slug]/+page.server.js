import * as api from '$lib/api';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const id = params.slug;
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.get(`videos/${id}?token=${token}&locale=${locale}`).then(async (res) => {
    return { video: res.data };
  });
}
