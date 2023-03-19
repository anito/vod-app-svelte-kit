import { de, enUS } from 'date-fns/locale/index';

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
    logo: 'https://files.doojoo.de/f/01e377c2785e4db4a69e/?dl=1',
    name: 'Immersive Studio',
    description: 'Immersive Life Dev',
    salutations: [
      'Bonjour',
      'Salute',
      'Ciao',
      'Holla',
      'Hi',
      'Welcome',
      'Welcom',
      'Willkommen',
      'Bem-vindo',
      'Velkommen',
      'Bonvenon',
      'Karibu',
      'Benvenuto',
      'Benvingut',
      'Tervetuloa'
    ]
  },
  Console: {
    infoLevel: '0',
    log: false
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
