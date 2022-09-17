import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, params }) {
  const data = locals.session.data;
  const slug = params.slug;
  return json(slug ? data[slug] : data);
}
