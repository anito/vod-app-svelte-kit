import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ locals }) {
  return json(locals.session.data);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request }) {
  const response = await request.json();
  return await locals.session
    .set({
      ...locals.session.data,
      ...response
    })
    .then((res) => json(res));
}
