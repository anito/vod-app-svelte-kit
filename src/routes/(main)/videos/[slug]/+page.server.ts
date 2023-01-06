import { redirect } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types';

export async function load({ locals }: PageServerLoadEvent) {
  if (!locals.session.data.user) {
    throw redirect(301, `/`);
  }
  return {};
}
