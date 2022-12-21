import { LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

const fallbackLocale = 'en';

function getInitialLocale() {
  let locale;
  LOCALESTORE.forEach((val, key) => {
    if (getLocaleFromNavigator()?.startsWith(key)) {
      locale = key;
    }
  });
  return locale;
}

/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
  const session = data.session;
  init({
    fallbackLocale,
    initialLocale: session.locale || getInitialLocale()
  });

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  await waitLocale();
  return { session, browser };
}
