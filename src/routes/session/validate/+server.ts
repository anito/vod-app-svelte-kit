import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ locals, request, fetch }: RequestEvent) {
  const { _expires, init } = await request.json();
  /**
   * With init flag true a fresh config will be loaded from the API Server (handled by server hook)
   */
  if (init) await fetch('/config?/reload=true');

  const isExpired = new Date() > new Date(locals.session.data._expires);
  const user = locals.session.data.user;
  if (!user || isExpired) {
    return json({ success: false });
  }
  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires, uid: user.id });
}
