import { redirect } from '@sveltejs/kit';
import type { PageLoadEvent } from './$types';

export async function load({ parent, fetch, url }: PageLoadEvent) {
  /**
   * Provided the session had been brought to life from any other browser tab,
   * this automatically redirects a user away from login  page (to redirect slug or home)
   * after a revisit (visibiltychange event)
   */
  const parentData = await parent();
  if (parentData.session.user) {
    throw redirect(301, url.searchParams.get('redirect') || '/');
  }

  const token = url.searchParams.get('token');
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      return {
        ...response,
        fromToken: true
      };
    });
  }
  return {};
}
