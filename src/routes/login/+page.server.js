import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  // Already logged in:
  if (locals.session.data.user) {
    // throw redirect(302, '/');
  }
  return {};
}
