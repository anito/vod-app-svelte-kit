import { redirect } from '@sveltejs/kit';
import { buildSearchParams, LOCALESTORE } from '$lib/utils';
import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

LOCALESTORE.forEach((val, key) => {
  register(key, () => import(`../messages/${val.filename}.json`));
});

/**
 * @type {import('$lib/types').Setting}
 */
let config;
const fallbackLocale = 'de-DE';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch, depends, url }) {
  const hasConfigParam = 'load' === url.searchParams.get('config');

  if (hasConfigParam || !config) {
    config = await fetch('/config')
      .then(async (res) => await res.json())
      .catch((reason) => console.error(reason));

    // redirect w/o config query
    if (hasConfigParam) {
      const searchParam = buildSearchParams(url.searchParams, { removableKeys: ['config'] });
      throw redirect(302, `${url.pathname}${searchParam}`);
    }
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
