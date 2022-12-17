/** @type {import('./$types').LayoutServerLoad} */
export async function load({ depends, locals }) {
  depends('app:session');

  const ua = locals.userAgent;
  return { session: locals.session.data, ua };
}
