import { redirect } from '@sveltejs/kit';
import type { PageLoadEvent } from './$types';

export async function load({ parent, fetch, url }: PageLoadEvent) {
  /**
   * Handles a token login
   */
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
