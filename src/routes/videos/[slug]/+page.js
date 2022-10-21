/** @type {import('./$types').PageLoad} */
export async function load({ fetch, parent }) {
  const parentData = await parent();
  const session = parentData.session;

  const user = await fetch(`/repos/users?id=${session.user?.id}`)
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .then((res) => {
      return res;
    })
    .catch((reason) => console.error(reason));

  return { user };
}
