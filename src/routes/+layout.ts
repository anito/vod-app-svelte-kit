import { LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';
import UAParser from 'ua-parser-js';
import type { LayoutLoadEvent } from './$types';

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

export async function load({ data, fetch }: LayoutLoadEvent) {
  const { session } = data;
  const initialLocale = session.locale || getInitialLocale();
  init({
    fallbackLocale,
    initialLocale
  });

  let { locale } = session;
  await fetch(`/session`, {
    method: 'POST',
    body: JSON.stringify({
      locale: locale || initialLocale || fallbackLocale
    })
  }).then(async (res) => {
    const json = await res.json();
    locale = json.locale;
  });

  const parser = new UAParser(data.ua);
  const browser = parser.getBrowser();

  await waitLocale();
  return { session: { ...session, locale }, browser };
}
