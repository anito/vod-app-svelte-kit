// @ts-nocheck
import { format } from 'date-fns';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { LOCALESTORE } from './const';

/**
 *
 * @param {Date} date
 * @param {string} dateFormat
 *
 * @returns {string} - The date in the supplied locale,
 *                     defaulting to the current system locale
 */
export const localeFormat = (date, dateFormat) => {
  return format(date, dateFormat, { locale: LOCALESTORE.get(get(locale)).fns });
};
