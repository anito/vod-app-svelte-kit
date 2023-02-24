import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, cookies }: RequestEvent) {
  const locale = locals.session.data.locale;
  await locals.session.destroy();
  // re-save locale to session
  await locals.session.set({ locale });

  return await api.post(`users/logout?locale=${locale}`).then((res) => {
    return json({
      ...res
    });
  });
}
