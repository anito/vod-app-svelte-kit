import { DEFAULT_LOCALE, LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

const fallbackLocale = DEFAULT_LOCALE;

function getInitialLocale() {
  let locale;
  LOCALESTORE.forEach((val, key) => {
    if (getLocaleFromNavigator()?.startsWith(key)) {
      locale = key;
    }
  });
  return locale;
}

export async function load({ data, fetch }) {
  const { session, config } = data;
  const initialLocale = session.locale || getInitialLocale();
  init({
    fallbackLocale,
    initialLocale
  });

  const parser = new UAParser(data.ua);
  const ua = parser.getBrowser();

  await waitLocale();
  return {
    session,
    ua,
    config,
    fromToken: false
  };
}
