import { format } from 'date-fns';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { DEFAULT_LOCALE, LOCALESTORE } from './const';

export const localeFormat = (date: Date, dateFormat: string) => {
  const _locale = get(locale) || DEFAULT_LOCALE;
  return format(date, dateFormat, { locale: LOCALESTORE.get(_locale)?.fns });
};
