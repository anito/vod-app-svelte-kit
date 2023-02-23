import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  if (!locals.session.data.user) {
    return json({ success: false });
  }

  const _expires = await request.json();

  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires, uid: locals.session.data.user.id });
}
