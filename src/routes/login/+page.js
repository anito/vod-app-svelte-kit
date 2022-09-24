/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const token = url.searchParams.get('token');
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      if (response.data.code >= 400) {
        // throw error(response.data.code, response.data);
      }
      return {
        session: { ...response.data },
        token: true
      };
    });
  }
  return {};
}
