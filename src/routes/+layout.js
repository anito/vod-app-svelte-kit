import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends }) {
  const config = data.config;
  const session = await fetch('/session')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  depends('app:session');

  await waitLocale();
  return { session, config };
}
