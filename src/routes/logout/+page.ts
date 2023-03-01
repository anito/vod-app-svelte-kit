import type { PageLoadEvent } from './$types';

export async function _load({ fetch }: PageLoadEvent) {
  await fetch('/auth/logout', { method: 'POST', body: JSON.stringify({ pending: true }) });
  return {};
}
