// @ts-nocheck

import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const locale = await request.json();

  await locals.session.set({
    ...locals.session.data,
    locale
  });
  return json({ locale });
}
