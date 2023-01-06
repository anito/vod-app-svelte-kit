import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  const response = await request.json();
  return await locals.session
    .set({
      ...locals.session.data,
      ...response
    })
    .then((res) => json(res));
}
