import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url, fetch }) => {
  if (locals.session.data.user) {
    // await fetch('/auth/logout');
    // redirect(302, `/logout?hotswap=${encodeURIComponent(url.pathname + url.search)}`);
    // redirect(302, `/logout`);
  }
  return {
    session: locals.session.data
  };
};
