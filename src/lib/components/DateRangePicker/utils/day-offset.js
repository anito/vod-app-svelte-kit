import { get } from 'svelte/store';
import { __locale__ } from '../stores/localeStore';
/**
 *
 * @param {string} firstDayOfWeek
 *
 * @returns {number} - 0 | 1 | 2 | 3 | 4 | 5 | 6
 */
export const dayOffset = firstDayOfWeek =>
  [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ].indexOf(firstDayOfWeek.toLocaleLowerCase( get(__locale__) ))
