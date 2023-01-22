import { de, enUS } from 'date-fns/locale/index';

export const DIFFSTORES = new Map([
  ['config', new Map()],
  ['page', new Map()]
]);
export const DEFAULT_LOCALE = 'en';
export const LOCALESTORE = new Map([
  [DEFAULT_LOCALE, { fns: enUS, localized: 'English', filename: 'en_US' }],
  ['de', { fns: de, localized: 'Deutsch', filename: 'de_DE' }]
]);
export const DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
} as {
  weekday: 'long' | 'short' | 'narrow' | undefined;
};
export const INBOX = 'inboxes';
export const SENT = 'sents';
export const ADMIN = 'Administrator';
export const SUPERUSER = 'Superuser';
export const USER = 'User';
export const DESC = 'DESC';
export const ASC = 'ASC';
export const TABS = ['time', 'profile', 'mail'];
export const DEFAULT_ADMIN_TAB = TABS[0];
