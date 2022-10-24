import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params, url }) {
  const parentData = await parent();
  const { session, users } = parentData;

  if (!session.user) {
    throw redirect(301, `/`);
  }

  const user = users.find(
    /** @param {import('$lib/types').User} usr */
    (usr) => usr.id === params.slug
  );
  if (!user) {
    throw redirect(307, `/users/${session.user.id}${url.search}`);
  }

  return { session: { ...parentData.session, file: 'PageLoad /users/[slug]/+page.js' } };
}
