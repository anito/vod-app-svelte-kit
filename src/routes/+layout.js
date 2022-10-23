import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, data }) {
  const session = await fetch('/session')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  const config = data.config;

  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  await waitLocale();
  return { session, config };
}
