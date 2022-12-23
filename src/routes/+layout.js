import { LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

const fallbackLocale = 'en';
const initialColorScheme = 'dark';

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
export async function load({ data, fetch }) {
  const { session } = data;
  const initialLocale = session.locale || getInitialLocale();
  init({
    fallbackLocale,
    initialLocale
  });

  let { locale, mode } = session;
  await fetch(`/session`, {
    method: 'POST',
    body: JSON.stringify({
      locale: locale || initialLocale || fallbackLocale,
      mode: mode || initialColorScheme
    })
  }).then(async (res) => {
    const json = await res.json();
    locale = json.locale;
    mode = json.mode;
  });

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  await waitLocale();
  return { session: { ...session, locale, mode }, browser };
}
