import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  const session = data.session;
  const config = data.config;

  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  await waitLocale();
  return { session, config };
}
