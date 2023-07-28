import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
}
