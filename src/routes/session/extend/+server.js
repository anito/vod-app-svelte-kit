// @ts-nocheck

import { error, json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const response = await request.json();

  await locals.session.set({
    ...locals.session.data,
    end: new Date(response).toISOString()
  });
  return json(locals.session.data);
}
