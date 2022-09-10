// @ts-nocheck

import { error, json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const response = await request.json();

  await locals.session.set({
    ...locals.session.data,
    start: response
  });
  return json(locals.session.data);
}
