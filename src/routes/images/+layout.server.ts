import * as api from '$lib/api';

export async function load({ fetch, locals }) {
  const { user } = locals.session.data;
  const images = await api.get(`images?locale=${locals.session.data.locale}`, {
    fetch,
    token: user?.jwt
  });

  return {
    images
  };
}
