import * as api from '$lib/api';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  const { pending } = await request.json();
  const locale = locals.session.data.locale;
  await locals.session.destroy();
  // re-save locale to session
  await locals.session.set({ locale, pending: pending || false });

  return await api.post(`users/logout?locale=${locale}`).then((res) => {
    return json({
      ...res
    });
  });
}
