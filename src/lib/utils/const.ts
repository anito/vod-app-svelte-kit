import de from 'date-fns/locale/de/index.js';
import enUS from 'date-fns/locale/en-US/index.js';

export const DIFFSTORES = new Map([
  ['config', new Map()],
  ['page', new Map()]
]);
export const DEFAULT_LOCALE = 'en';
export const LOCALESTORE = new Map([
  [DEFAULT_LOCALE, { fns: enUS, localized: 'English', filename: 'en-US' }],
  ['de', { fns: de, localized: 'Deutsch', filename: 'de-DE' }]
]);
export const DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric'
} as {
  weekday: 'long' | 'short' | 'narrow' | undefined;
};
export const DEFAULT_CONFIG = {
  Session: {
    lifetime: '3600',
    logoutredirect: '/login'
  },
  Site: {
    logo: '',
    name: 'VoD Manager',
    description: '',
    salutations: []
  },
  Console: {
    infoLevel: '0',
    log: false
  },
  Misc: {
    'web-vitals': false
  }
};
export const VIDEO = 'videos';
export const IMAGE = 'images';
export const INBOX = 'inboxes';
export const SENT = 'sents';
export const ADMIN = 'Administrator';
export const SUPERUSER = 'Superuser';
export const USER = 'User';
export const DESC = 'DESC';
export const ASC = 'ASC';
export const TABS = ['time', 'profile', 'mail'];
export const DEFAULT_TAB = TABS[0];
export const EDIT = 'edit';
export const ADD = 'add';
export const DEL = 'del';
export const PASS = 'pass';
export const LIGHT = 'light';
export const DARK = 'dark';
