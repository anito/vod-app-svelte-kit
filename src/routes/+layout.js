import { redirect } from '@sveltejs/kit';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

/**
 * @type {import('$lib/types').Config}
 */
let config;
const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends, url }) {
  const hasConfigParam = 'load' === url.searchParams.get('config');

  if (hasConfigParam || !config) {
    config = await fetch('/config')
      .then(async (res) => await res.json())
      .catch((reason) => console.error(reason));

    if (hasConfigParam) {
      url.searchParams.delete('config');
      const searchParam = url.searchParams.toString();
      throw redirect(302, `${url.pathname}${searchParam && '?' + searchParam}`);
    }
  }

  const session = data.session;
  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  depends('app:config');

  await waitLocale();
  return { session, config };
}
