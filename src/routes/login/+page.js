/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  /** @type {Object<string, any>} */
  const searchParams = {};
  for (const [key, val] of url.searchParams) {
    searchParams[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  /** @type {Object<any, any>} */
  const { token } = { ...searchParams };
  if (searchParams.token) {
    return await fetch(`/auth/login?token=${token}`).then(async (res) => {
      const response = await res.json();
      return { ...response.data, ...searchParams };
    });
  }
  return {};
}
