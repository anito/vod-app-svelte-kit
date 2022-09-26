/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const token = url.searchParams.get('token');
  if (token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      return { session: { ...response.data }, token: true };
    });
  }
  return {};
}
