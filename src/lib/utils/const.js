import { de, enUS } from 'date-fns/locale/index';

export const DIFFSTORES = new Map([
  ['config', new Map()],
  ['page', new Map()]
]);
/**
 * @type {Map<any, {fns: any; localized: string; filename: string; }>}
 */
export const LOCALESTORE = new Map([
  ['de-DE', { fns: de, localized: 'Deutsch', filename: 'de_DE' }],
  ['en-US', { fns: enUS, localized: 'English', filename: 'en_US' }]
]);
/**
 * @type {Intl.DateTimeFormatOptions}
 */
export const DateTimeFormatOptions = {
  day: '2-digit',
  year: 'numeric',
  month: '2-digit'
};
export const CONFIG = new Map();
export const INBOX = 'inboxes';
export const SENT = 'sents';
export const ADMIN = 'Administrator';
export const SUPERUSER = 'Superuser';
export const USER = 'User';
export const DESC = 'DESC';
export const ASC = 'ASC';
export const TABS = ['time', 'profile', 'mail'];
export const DEFAULT_TAB = 'user';
