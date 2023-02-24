import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  const isExpired = new Date() > new Date(locals.session.data._expires);
  const emptyuser = !locals.session.data.user;
  const { _expires, noob } = await request.json();

  if (!noob && (emptyuser || isExpired)) {
    return json({ success: false });
  }

  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires, uid: locals.session.data.user.id });
}
