import * as api from '$lib/api';
import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function GET({ locals }: RequestEvent) {
  const { locale } = locals.session.data;

  return json(
    await api.get(`settings?locale=${locale}`).then((res) => {
      if (res?.success) {
        return res.data;
      }
      throw error(401);
    })
  );
}
