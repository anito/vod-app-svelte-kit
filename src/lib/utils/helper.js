import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { ADMIN, SUPERUSER, INBOX, DIFFSTORES } from './const';

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns
 */
export function sortByTitle(a, b) {
  let _a = a.title?.toUpperCase() || '';
  let _b = b.title?.toUpperCase() || '';
  return (_a < _b && -1) || (_a > _b && 1) || 0;
}

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns {number}
 */
export function sortByName(a, b) {
  let _a = a.name?.toUpperCase() || '';
  let _b = b.name?.toUpperCase() || '';
  return (_a < _b && -1) || (_a > _b && 1) || 0;
}

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns {number}
 */
export function sortByStartDate(a, b) {
  let aStart = a._joinData.start || new Date('3000');
  let bStart = b._joinData.start || new Date('3000');
  return new Date(bStart).getTime() - new Date(aStart).getTime();
}

/**
 *
 * @param {*} a
 * @param {*} b
 * @returns {number}
 */
export function sortByEndDate(a, b) {
  let aEnd = a._joinData.end || new Date('3000');
  let bEnd = b._joinData.end || new Date('3000');
  return new Date(bEnd).getTime() - new Date(aEnd).getTime();
}

/**
 *
 * @param {Object} obj_1
 * @param {Object} obj_2
 * @returns {boolean}
 */
export function equals(obj_1, obj_2) {
  let json_1 = typeof obj_1 === 'object' && JSON.stringify(obj_1);
  let json_2 = typeof obj_2 === 'object' && JSON.stringify(obj_2);
  if (!!json_1 && !!json_2) {
    return json_1 === json_2;
  }
  return false;
}

/**
 *
 * @param {*} d
 * @returns {string}
 */
export function formatter(d) {
  let hrs = d / 1000 / 60 / 60;
  let min = (!isNaN(hrs) && ((hrs % Math.floor(hrs)) * 60) % 60) || 0;
  let sec = (!isNaN(min) && ((min % Math.floor(min)) * 60) % 60) || 0;
  return `${Math.floor(hrs)}:${Math.floor(min)}:${Math.floor(sec)}`;
}

/**
 *
 * @param {URL} url
 * @param {Map<string, any>} searchMap
 * @returns {string}
 */
export function createRedirectSlug(url, searchMap = new Map([])) {
  /** @type {URLSearchParams} */
  let searchParams;
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

/**
 *
 * @param {URL} url
 * @param {import('$lib/types').Session} session
 * @returns
 */
export function processRedirect(url, session) {
  let redirect = url.searchParams.get('redirect');
  if (redirect) {
    return redirect;
  } else {
    const hasPrivileges = session?.role === ADMIN || session?.role === SUPERUSER;
    const path = hasPrivileges ? '/users' : '/videos';
    return path.concat(parseRedirect(url.searchParams));
  }
}

/**
 *
 * @param {URLSearchParams | string} search
 * @returns {string}
 */
export function parseRedirect(search) {
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
  /** @param {any} num */
  const convertBase = (num) => {
    return {
      /** @param {number} baseFrom */
      from: (baseFrom) => {
        return {
          /** @param {number} baseTo */
          to: (baseTo) => {
            return parseInt(num, baseFrom).toString(baseTo);
          }
        };
      }
    };
  };

  return {
    /**
     *
     * @param {number} num
     * @param {boolean} rel
     * @returns
     */
    dec2Hex: (num, rel) => {
      rel && (num *= 255);
      return convertBase(num).from(10).to(16);
    }
  };
})();

/**
 * @param {string} eventType
 * @param {*} detail
 */
export const proxyEvent = function (eventType, detail = {}) {
  eventType = typeof eventType === 'string' ? eventType : detail.eventType;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
};

/**
 * @param {Array<string>} arr
 */
export function randomItem(arr = []) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

/**
 * see https://gist.github.com/codeguy/6684588
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
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
  const placeholder = 'https://via.placeholder.com/100x100.png?text=';
  return `${placeholder}${name
    .split(' ')
    .map((val) => val.substring(0, 1))
    .join('')}`;
}

/**
 *
 * @param {Function} fn
 * @param {string | string[]} colors
 * @returns {string}
 */
export function svg(fn, colors) {
  colors = (!Array.isArray(colors) && [colors]) || colors;
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      fn.apply(
        null,
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

/**
 * @param {string} tab
 * @returns {string}
 */
export function createTabSearch(tab) {
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

/**
 * @param {string | boolean} lifetime
 * @returns {number}
 */
export function parseLifetime(lifetime) {
  const minToMs = 60 * 1000;
  return parseFloat(typeof lifetime === 'boolean' ? (lifetime ? '1' : '0') : lifetime) * minToMs;
}

/**
 * @param {URL} url
 */
export function searchParams(url) {
  /**
   * @type {Object<string, any>}
   */
  const params = {};
  for (const [key, val] of url.searchParams) {
    params[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  return params;
}

/**
 * @param {Response} res
 */
export async function bodyReader(res) {
  const reader = res.body?.getReader();
  const contentLength = res.headers.get('content-length') || 0;

  let chunks = [];
  let receivedLength = 0;
  let percent;
  while (true) {
    /**
     * @type {any}
     */
    const { done, value } = await reader?.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value?.length;
    if (contentLength !== 0) (receivedLength * 100) / parseInt(contentLength);
    console.log('Progress', percent, '% of', contentLength);
  }

  /**
   * concatenate chunks into single Uint8Array
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
   */
  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  /**
   * decode into a utf-8 string
   * https://nodejs.org/api/util.html#class-utiltextdecoder
   */
  let result = new TextDecoder('utf-8').decode(chunksAll);
  return result;
}

/**
 * @param {{[s: string]: any;}} data
 * @param {{prefix?: string | undefined, store: string}} options - prefix: The key of object values (automatically set)
 * @returns {void}
 */
export function printDiff(data, { prefix, store } = { prefix: '', store: '' }) {
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

/**
 * @param {string | undefined} id
 * @param {{ pathname: any; search: any; searchParams?: URLSearchParams } | undefined} [url]
 */
export function dynamicUrl(id, url) {
  const pathname = url?.pathname;
  const dynamicPathname = pathname.replace(/\/[0-9a-zA-Z_-]+$/, `/${id}`);
  const searchParams = buildSearchParams(url?.searchParams, { removableKeys: ['mail_id'] });
  return `${dynamicPathname}${searchParams}`;
}

/**
 * Helper function for dynamicUrl
 * @param {URLSearchParams | string | undefined} searchParams
 * @param {{ removableKeys: Array<string>}} [options]
 * @returns {string}
 */
export function buildSearchParams(searchParams, options = { removableKeys: [] }) {
  const { removableKeys } = { ...options };
  const searchParam = new URLSearchParams(searchParams);
  removableKeys.forEach((key) => {
    searchParam?.has(key) && searchParam.delete(key);
  });
  const search = searchParam?.toString();
  return (search && `?${search}`) || '';
}

export function log() {
  const { log } = get(settings).Console;
  if (log) console.log(...arguments);
}

/**
 * Accepts 1 or more arguments
 * First argument: Level
 * Rest: parameter printed to console
 * @returns
 */
export function info() {
  if (arguments.length < 2) return;
  const { infoLevel } = get(settings).Console;
  const args = Array.from(arguments);
  const level = args.splice(0, 1)[0];
  if (level <= infoLevel) console.log(...args);
}

/**
 * @param {any} data
 */
export function parseConfigData(data) {
  if (data instanceof Object) {
    /** @type {any} */
    const ret = {};
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

Array.prototype.unique = function () {
  return this.filter((val, index, self) => self.indexOf(index) != val);
};

/**
 * @param {number} minimumIntegerDigits
 * @returns {string}
 */
Number.prototype.minDigits = function (minimumIntegerDigits = 2) {
  return this.toLocaleString('en-US', {
    minimumIntegerDigits
  });
};

/**
 * @param {string} val
 * @returns {string}
 */
String.prototype.remove = function (val) {
  const arr = this.split(/\s+/);
  return arr
    .filter((item) => item != val)
    .unique()
    .join(' ')
    .trim();
};

/**
 * @param {string} val
 * @returns {string}
 */
String.prototype.add = function (val) {
  let arr = this.split(' ');
  return arr.concat(val).unique().join(' ').trim();
};
