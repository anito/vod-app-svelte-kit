import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
};
