/** @type {import('./$types').LayoutServerLoad} */
export async function load({ depends, locals }) {
  depends('app:session');

  console.log('load', locals);
  const ua = locals.userAgent;
  return { session: locals.session.data, ua };
}
