export async function load({ depends, locals }) {
  depends('app:session');

  return {
    session: locals.session.data,
    ua: locals.userAgent,
    config: locals.config
  };
}
