import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request }) {
  const _expires = await request.json();

  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires });
}
