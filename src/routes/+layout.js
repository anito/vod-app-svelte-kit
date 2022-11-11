import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends }) {
  const session = data.session;
  const config = await fetch('/config')
    .then(async (res) => await res.json())
    .catch((reason) => console.error(reason));

  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  depends('app:config');

  await waitLocale();
  return { session, config };
}
