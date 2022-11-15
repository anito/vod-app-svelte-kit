/** @type {import('./$types').LayoutServerLoad} */
export async function load({ fetch, depends, locals }) {
  /**
   * @type {import('$lib/types').Video[]}
   */
  const videos = await fetch('/repos/videos')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  /**
   * @type {import('$lib/types').Image[]}
   */
  const images = await fetch('/repos/images')
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));

  const user = await fetch(`/repos/users?id=${locals.session.data.user?.id}`)
    .then(async (res) => {
      if (res.ok) return await res.json();
    })
    .catch((reason) => console.error(reason));
  depends('app:videos');
  depends('app:user');

  return { user, videos, images };
}