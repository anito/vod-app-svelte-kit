import { CONFIG, LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends }) {
  if (!CONFIG.has('data')) {
    CONFIG.set(
      'data',
      await fetch('/config')
        .then(async (res) => await res.json())
        .catch((reason) => console.error(reason))
    );
  }

  const session = data.session;
  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  depends('app:config');

  await waitLocale();
  return { session, config: CONFIG.get('data'), browser };
}
