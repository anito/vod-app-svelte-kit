/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, parent }) {
  const parentData = await parent();
  const token = url.searchParams.get('token');
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      return {
        ...response,
        fromToken: true,
        file: 'PageLoad /login/+page.js'
      };
    });
  }
  return {
    session: {
      ...parentData.session,
      file: 'PageLoad /login/+page.js'
    }
  };
}
