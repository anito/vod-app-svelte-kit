import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params }) {
  const parentData = await parent();

  /**
   * @type {{session: import('$lib/types').Session}}
   */
  const { session } = parentData;

  if (!session.user) {
    throw redirect(301, `/`);
  }

  return {};
}
