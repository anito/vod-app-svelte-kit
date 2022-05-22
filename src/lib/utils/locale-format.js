// @ts-nocheck
import { format } from 'date-fns';
import * as locale from 'date-fns/locale/index.js';
import { get } from 'svelte/store';
import { locale  as _locale} from 'svelte-i18n';

/**
 *
 * @param {Date} date
 * @param {string} dateFormat
 *
 * @returns {string} - The date in the supplied locale,
 *                     defaulting to the current system locale
 */
export const localeFormat = (date, dateFormat) => {
	return format(date, dateFormat, { locale: locale[get(_locale).slice(0, 2)] });
};
