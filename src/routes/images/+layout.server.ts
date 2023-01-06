import * as api from '$lib/api';
import type { LayoutServerLoadEvent } from './$types';

export async function load({ fetch, locals }: LayoutServerLoadEvent) {
  const { user } = locals.session.data;
  const images = await api.get(`images?locale=${locals.session.data.locale}`, {
    fetch,
    token: user?.jwt
  });

  return {
    images
  };
}
