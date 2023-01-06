import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  const _expires = await request.json();

  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires });
}
