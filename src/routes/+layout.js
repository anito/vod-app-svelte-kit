import { browser } from '$app/environment';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

/**
 * @type {import('$lib/types').Config}
 */
let config;
const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends }) {
  // const forceLoad = url.searchParams.get('config') === 'load' || !config;

  if (!config) {
    config = await fetch('/config')
      .then(async (res) => await res.json())
      .catch((reason) => console.error(reason));
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
