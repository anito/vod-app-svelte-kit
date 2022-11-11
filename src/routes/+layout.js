import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'de-DE';
const c = {};
let config = c;

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends, url }) {
  let force = false;
  if (url.searchParams.get('force') === 'config') {
    force = true;
  }

  // prevent config from being unnecessarily fetched
  const needsLoad = config === c || force;
  if (needsLoad) {
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
