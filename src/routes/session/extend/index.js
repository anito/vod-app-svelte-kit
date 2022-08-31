// @ts-nocheck
export async function post({ locals, request }) {
  const start = await request.json();

  await locals.session.set({
    ...locals.session.data,
    start
  });
  return {
    status: 200,
    body: {
      data: locals.session.data
    }
  };
}
