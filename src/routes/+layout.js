import { register, waitLocale, init, getLocaleFromNavigator } from 'svelte-i18n';

register('de-DE', () => import('../messages/de_DE.json'));
register('en-US', () => import('../messages/en_US.json'));

const fallbackLocale = 'en-US';

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, fetch }) {
  console.log('DATA.SESSION +layout.ts load({ data })', data?.session);
  async function getLocaleFromSession() {
    return await fetch('/session/locale')
      .then(async (res) => {
        if (res.ok) {
          return await res.json();
        }
      })
      .then((res) => {
        return res;
      })
      .catch((reason) => console.error(reason));
  }
  async function getConfig() {
    return await fetch('/config')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((res) => {
        return res.data;
      })
      .catch((reason) => console.error(reason));
  }

  const locale = await getLocaleFromSession();
  const config = await getConfig();

  init({
    fallbackLocale,
    initialLocale: locale || getLocaleFromNavigator()
  });

  await waitLocale();
  return { config, ...data };
}
