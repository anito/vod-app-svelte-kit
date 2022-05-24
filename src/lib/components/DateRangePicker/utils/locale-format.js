import { format } from 'date-fns';
import { __locale__ } from '../stores/localeStore';
import { get } from 'svelte/store';

/**
 *
 * @param {Date} date
 * @param {string} dateFormat
 *
 * @returns {string} - The date in the supplied locale,
 *                     defaulting to the current system locale
 */
export const localeFormat = (date, dateFormat) => {
	return format(date, dateFormat, { locale: get(__locale__) });
};
