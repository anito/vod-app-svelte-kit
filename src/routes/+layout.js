import { LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  const session = data.session;
  init({
    fallbackLocale,
    initialLocale: session.locale || getLocaleFromNavigator()
  });

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  await waitLocale();
  return { session, browser };
}
