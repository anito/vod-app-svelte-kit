import { json } from '@sveltejs/kit';

export async function POST({ locals, request }) {
  const response = await request.json();
  return await locals.session
    .set({
      ...locals.session.data,
      ...response
    })
    .then((res) => json(res));
}
