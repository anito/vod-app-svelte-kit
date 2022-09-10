import * as api from '$lib/api';

export async function load({ parent }) {
  const { session } = await parent();
  const images = await api.get('images', { token: session.user?.jwt });

  return {
    images
  };
}
