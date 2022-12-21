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
export async function load({ data, fetch }) {
  const { session } = data;
  const initialLocale = session.locale || getInitialLocale();
  init({
    fallbackLocale,
    initialLocale
  });

  // we need locale in session early for api calls, so don't wait until user switches locale to store locale in session
  let { locale } = session;
  if (!locale) {
    await fetch(`/locale`, {
      method: 'POST',
      body: JSON.stringify({ locale: initialLocale || fallbackLocale })
    }).then(async (res) => {
      const json = await res.json();
      locale = json.locale;
    });
  }

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  await waitLocale();
  return { session: { ...session, locale }, browser };
}
