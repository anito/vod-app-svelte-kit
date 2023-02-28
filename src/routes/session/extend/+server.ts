import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request }: RequestEvent) {
  const isExpired = new Date() > new Date(locals.session.data._expires);
  const user = locals.session.data.user;
  if (!user || isExpired) {
    return json({ success: false });
  }

  const { _expires } = await request.json();
  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires, uid: user.id });
}
