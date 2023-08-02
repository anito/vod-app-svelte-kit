export const load = async ({ fetch, url, data }) => {
  /**
   * Handles token login
   */
  const token = url.searchParams.get('token');
  if (token) {
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
