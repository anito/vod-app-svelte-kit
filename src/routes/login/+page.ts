import type { PageLoadEvent } from './$types';

export async function load({ fetch, url, data }: PageLoadEvent) {
  /**
   * Handles token login / hotswap
   */
  const token = url.searchParams.get('token');
  if (token) {
    if (data.session.user) {
      return {
        hotswap: `/logout?hotswap=${encodeURIComponent(url.pathname + url.search)}`
      };
    }
    return await fetch(`/auth/login?token=${token}`)
      .then(async (res) => await res.json())
      .then((res) => {
        return {
          ...res,
          fromToken: true
        };
      });
  }

  return {};
}
