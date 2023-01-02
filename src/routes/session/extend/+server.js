import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, request, setHeaders }) {
  const _expires = await request.json();

  setHeaders({
    age: '1000000',
    'cache-control': '10000000'
  });

  await locals.session.update(() => ({ _expires }));
  return json({ success: true, _expires });
}
