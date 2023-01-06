import * as api from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ request, locals }: RequestEvent) {
  const data = await request.json();
  const { locale, user } = locals.session.data;
  const token = user?.jwt;

  return await api.post(`users?locale=${locale}`, { data, token }).then(async (res) => {
    return json(res);
  });
}
