import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { ADMIN, SUPERUSER, INBOX, DIFFSTORES } from './const';
import type { Session } from '$lib/types';

export function sortByStartDate(
  a: { _joinData: { start: Date } },
  b: { _joinData: { start: Date } }
) {
  let aStart = a._joinData.start || new Date('3000');
  let bStart = b._joinData.start || new Date('3000');
  return new Date(bStart).getTime() - new Date(aStart).getTime();
}

export function sortByEndDate(a: { _joinData: { end: Date } }, b: { _joinData: { end: Date } }) {
  let aEnd = a._joinData.end || new Date('3000');
  let bEnd = b._joinData.end || new Date('3000');
  return new Date(bEnd).getTime() - new Date(aEnd).getTime();
}

export function equals(obj_1: any, obj_2: any) {
  let json_1 = typeof obj_1 === 'object' && JSON.stringify(obj_1);
  let json_2 = typeof obj_2 === 'object' && JSON.stringify(obj_2);
  if (!!json_1 && !!json_2) {
    return json_1 === json_2;
  }
  return false;
}

export function formatter(d: number) {
  let hrs = d / 1000 / 60 / 60;
  let min = (!isNaN(hrs) && ((hrs % Math.floor(hrs)) * 60) % 60) || 0;
  let sec = (!isNaN(min) && ((min % Math.floor(min)) * 60) % 60) || 0;
  return `${Math.floor(hrs)}:${Math.floor(min)}:${Math.floor(sec)}`;
}

export function createRedirectSlug(url: URL, searchMap = new Map()) {
  let searchParams: URLSearchParams;
  let path;
  const ignored = ['login'];

  if (typeof url === 'string') {
    let urlString = url;
    url = new URL(urlString, window.location.hostname);
    searchParams = new URLSearchParams(urlString);
  } else {
    searchParams = url.searchParams;
  }
  searchMap.forEach((val, name) => {
    !searchParams.has(name) && searchParams.append(name, val);
  });
  path = url.pathname;

  for (let ignore of ignored) {
    let regex = new RegExp(`\\b${ignore}`, 'g');
    path = path.replace(regex, '');
  }
  return `redirect=${path}${encodeURIComponent(parseRedirect(searchParams))}`;
}

export function processRedirect(url: URL, session: Session) {
  let redirect = url.searchParams.get('redirect');
  if (redirect) {
    return redirect;
  } else {
    const hasPrivileges = session?.role === ADMIN || session?.role === SUPERUSER;
    const path = hasPrivileges ? '/users' : '/videos';
    return path.concat(parseRedirect(url.searchParams));
  }
}

export function parseRedirect(search: URLSearchParams) {
  const removableKeys = ['token', 'redirect', 'sessionend'];
  return buildSearchParams(search, { removableKeys });
}

export function windowSize() {
  var width = 0,
    height = 0;
  if (
    document.documentElement &&
    (document.documentElement.clientWidth || document.documentElement.clientHeight)
  ) {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
  } else {
    if ('number' == typeof window.innerWidth) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
      width = document.body.clientWidth;
      height = document.body.clientHeight;
    }
  }
  return {
    height: height,
    width: width
  };
}

// https://gist.github.com/faisalman/4213592
export let convert = (() => {
  const convertBase = (num: string | number) => {
    return {
      from: (baseFrom: number | undefined) => {
        return {
          to: (baseTo: number | undefined) => {
            return parseInt(num as string, baseFrom).toString(baseTo);
          }
        };
      }
    };
  };

  return {
    dec2Hex: (num: number, rel: any) => {
      rel && (num *= 255);
      return convertBase(num).from(10).to(16);
    }
  };
})();

export const proxyEvent = function (eventType: string, detail?: any, target?: Window) {
  eventType = typeof eventType === 'string' ? eventType : detail?.eventType;
  target = typeof window !== 'undefined' ? window : target;
  if (target) {
    target.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
};

export function randomItem(arr = []) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

/**
 * see https://gist.github.com/codeguy/6684588
 */
export function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  var to = 'aaaaeeeeiiiioooouuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

export function placeholderDotComAvatar(name = '?') {
  const placeholder = 'https://placehold.co/100x100?text=';
  return `${placeholder}${name
    .split(' ')
    .map((val) => val.substring(0, 1))
    .join('')}`;
}

export function svg(fn: { (c: any): string }, colors: string | string[]) {
  colors = (!Array.isArray(colors) && [colors]) || colors;
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      fn(
        ((c) => {
          for (var fillColors = [], i = 0; i < c.length; i++) {
            fillColors.push(c[i]);
          }
          return fillColors;
        })(colors)
      )
    )
  );
}

export function filterByModelKeys(search: string, stack: any, keys: string = '') {
  const modelKeys = keys.replace(/\s+/, '').split(',');
  return (
    stack?.filter((item: any) => {
      let n = modelKeys.length;
      let res = false;
      while (n > 0) {
        res = item[modelKeys[--n]]?.toLowerCase().indexOf(search.toLowerCase()) !== -1;
        if (res) break;
      }
      return res;
    }) || []
  );
}

export function addClass(node: HTMLElement, className: string) {
  const classNames = className.trim().replace(/(\s+)/g, ' ').split(' ');
  classNames.map((cn) => cn && node.classList.add(cn));
}

export function createTabSearch(tab: string) {
  const search =
    tab === 'time'
      ? `?tab=${tab}`
      : tab === 'profile'
      ? `?tab=${tab}`
      : tab === 'mail'
      ? `?tab=${tab}&active=${INBOX}`
      : '';
  return search;
}

export function parseLifetime(lifetime: boolean | string | number) {
  const toMs = 1000;
  lifetime = typeof lifetime === 'boolean' ? (lifetime ? 1 : 0) : lifetime;
  lifetime = typeof lifetime === 'string' ? parseFloat(lifetime) : lifetime;
  return lifetime * toMs;
}

export function searchParams(url: URL) {
  const params = Object.create({});
  for (const [key, val] of url.searchParams) {
    params[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  return params;
}

export function printDiff(
  data: object | null,
  { prefix, store } = { prefix: '', store: '' } as { prefix?: string; store: string }
) {
  if (data instanceof Object && DIFFSTORES.has(store)) {
    Object.entries(data).forEach((val) => {
      const diffStore = DIFFSTORES.get(store);
      const key = val[0];
      const value = val[1];
      const newKey = `{ ${prefix}: ${key} }`;
      if (typeof key !== 'object') {
        let newValue = typeof value === 'string' ? value : JSON.stringify(value);
        let oldValue = diffStore?.get(newKey);
        if (!diffStore?.has(newKey)) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            printDiff(value, { prefix: key, store });
          } else {
            diffStore?.set(newKey, newValue);
          }
        } else {
          if (oldValue !== newValue) {
            info(
              1,
              '%c %s %c %s %c %s',
              `background: #d2d2d2; color: #000000; padding:4px 6px 3px 0;`,
              `DIFF ${store.toUpperCase()} DATA: ${newKey}`,
              'background: #ffebe9; color: #000000; padding:4px 6px 3px 0;',
              oldValue,
              'background: #e6ffec; color: #000000; padding:4px 6px 3px 0;',
              newValue
            );
            diffStore?.set(newKey, newValue);
          }
        }
      } else {
        printDiff(key);
      }
    });
  }
}

export function dynamicUrl(id: any, url: URL) {
  const pathname = url?.pathname;
  const dynamicPathname = pathname.replace(/\/[0-9a-zA-Z_-]+$/, `/${id}`);
  const searchParams = buildSearchParams(url?.searchParams, {
    removableKeys: ['mail_id']
  });
  return `${dynamicPathname}${searchParams}`;
}

export function buildSearchParams(
  searchParams: string | URLSearchParams | string[][] | Record<string, string> | undefined,
  options: {
    removableKeys?: string[];
    addableKeys?: string[][];
  } = {}
) {
  const { removableKeys, addableKeys } = { ...options };
  const searchParam = new URLSearchParams(searchParams);
  addableKeys?.forEach((key) => {
    if (key.length === 2) {
      searchParam?.set(key[0], key[1]);
    }
  });
  removableKeys?.forEach((key) => {
    searchParam?.has(key) && searchParam.delete(key);
  });
  const search = searchParam?.toString();
  return (search && `?${search}`) || '';
}

export function log(...args: any[]) {
  const { log } = get(settings).Console;
  if (log) console.log(...arguments);
}

export function info(...args: any[]) {
  if (arguments.length < 2) return;
  const { infoLevel } = get(settings).Console;
  args = Array.from(arguments);
  const level = args.splice(0, 1)[0];
  if (level <= infoLevel) console.log(...args);
}

export function stringify(params: any) {
  return JSON.stringify(params).replace(/["'\s]/g, '');
}

export function parseConfigData(data: object | null | undefined) {
  if (data instanceof Object) {
    const ret = Object.create({});
    Object.entries(data).forEach((val) => {
      let k = val[0];
      let v = val[1];
      v = typeof v === 'object' && !Array.isArray(v) ? parseConfigData(v) : v;
      v = typeof v === 'boolean' ? (v ? 1 : 0) : v;
      ret[k] = v;
    });
    return ret;
  }
  throw 'Configuration data incorrect';
}

Array.prototype.sortBy = function (/** @type {string | number} */ key) {
  return this.sort((a, b) => {
    let _a = a[key]?.toLowerCase() || '';
    let _b = b[key]?.toLowerCase() || '';
    return _a < _b ? -1 : _a > _b ? 1 : 0;
  });
};

Array.prototype.unique = function () {
  return this.filter((val, index, self) => self.indexOf(index) != val);
};

Number.prototype.minimumIntegerDigits = function (minimumIntegerDigits = 2) {
  return this.toLocaleString('en-US', {
    minimumIntegerDigits
  });
};

Number.prototype.minimumFractionDigits = function (minimumFractionDigits = 2) {
  return this.toLocaleString('en-US', {
    minimumFractionDigits
  });
};

Number.prototype.toHHMMSS = function () {
  const seconds = Number(this);
  const hrs_num = Math.floor(seconds / 3600);
  const min_num = Math.floor((seconds - hrs_num * 3600) / 60);
  const sec_num = Math.floor(seconds - hrs_num * 3600 - min_num * 60);

  const hrs = hrs_num < 10 ? '0' + hrs_num : hrs_num;
  const min = min_num < 10 ? '0' + min_num : min_num;
  const sec = sec_num < 10 ? '0' + sec_num : sec_num;
  if (seconds < 6000) {
    return min + ':' + sec;
  }
  return hrs + ':' + min + ':' + sec;
};

String.prototype.remove = function (val) {
  const arr = this.split(/\s+/);
  return arr
    .filter((item) => item != val)
    .unique()
    .join(' ')
    .trim();
};

String.prototype.add = function (val) {
  let arr = this.split(' ');
  return arr.concat(val).unique().join(' ').trim();
};