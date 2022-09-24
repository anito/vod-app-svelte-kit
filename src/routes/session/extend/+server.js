// @ts-nocheck

import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const _expires = await request.json();

  await locals.session.set({
    ...locals.session.data,
    _expires
  });
  return json(locals.session.data);
}
