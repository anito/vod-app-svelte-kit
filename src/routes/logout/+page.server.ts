import type { PageServerLoadEvent } from '../$types';

export async function load({ locals }: PageServerLoadEvent) {
  return {
    session: { ...locals.session.data }
  };
}
