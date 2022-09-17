/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  /** @type {Object<string, any>} */
  const params = {};
  for (const [key, val] of url.searchParams) {
    params[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  /** @type {Object<any, any>} */
  const { token, result } = { ...params };
  if (params.token) {
    if (result === 'success') {
      return await fetch(`/auth/login?token=${token}`).then(async (res) => {
        const response = await res.json();
        return { ...response.data, ...params };
      });
    } else {
      return { ...params };
    }
  }
  return {};
}
