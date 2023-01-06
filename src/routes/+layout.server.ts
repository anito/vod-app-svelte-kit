import type { LayoutServerLoadEvent } from './$types';

export async function load({ depends, locals }: LayoutServerLoadEvent) {
  depends('app:session');

  const ua = locals.userAgent;
  return { session: locals.session.data, ua };
}
