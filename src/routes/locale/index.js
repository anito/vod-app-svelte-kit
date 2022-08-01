// @ts-nocheck
export async function post({ locals, request }) {
  const locale = await request.json();

  await locals.session.set({
    ...locals.session.data,
    locale
  });
  return {
    status: 200
  };
}
