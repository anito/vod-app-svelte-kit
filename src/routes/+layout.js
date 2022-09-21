import { register, waitLocale, init, getLocaleFromNavigator, locale as loc } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'en-US';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch }) {
  const session = await fetch('/session')
    .then((res) => res.json())
    .catch((reason) => console.error(reason));

  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  await waitLocale();
  return { session };
}
