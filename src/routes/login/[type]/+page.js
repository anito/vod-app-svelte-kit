/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url, params }) {
  const token = url.searchParams.get('token');
  const type = params.type;
  const response = await fetch(`/auth/login?token=${token}`).then(async (res) => {
    const response = await res.json();
    return { ...response };
  });
  console.log(type, response);
  return {};
}
