export const load = async ({ fetch, url, data }) => {
  /**
   * Handles token / hotswap login
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
};
