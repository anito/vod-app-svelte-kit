import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const parentData = await parent();
  const { session } = parentData;
  if (!session.user) {
    throw redirect(301, `/`);
  }
}
