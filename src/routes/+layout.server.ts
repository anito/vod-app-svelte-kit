import type { LayoutServerLoadEvent } from './$types';

export async function load({ depends, locals }: LayoutServerLoadEvent) {
  depends('app:session');

  return {
    session: locals.session.data,
    ua: locals.userAgent,
    config: locals.config,
    logger: locals.logger
  };
}
