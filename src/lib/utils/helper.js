import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { ADMIN, SUPERUSER, INBOX } from './const';

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
  return `?redirect=${path}${encodeURIComponent(parseSearchParams(searchParams))}`;
}

/**
 *
 * @param {URL} url
 * @param {import('$lib/types').Session} session
 * @returns
 */
export function processRedirect(url, session) {
  let redirect;
  if ((redirect = url.searchParams.get('redirect'))) {
    return redirect;
  } else {
    const hasPrivileges = session?.role === ADMIN || session?.role === SUPERUSER;
    const path = hasPrivileges ? '/users' : '/videos';
    return path.concat(parseSearchParams(url.searchParams));
  }
}

/**
 *
 * @param {URLSearchParams | string} search
 * @returns
 */
export function parseSearchParams(search) {
  const excludeSet = new Set(['token', 'redirect', 'sessionend']);
  const searchParams = new URLSearchParams(search);
  excludeSet.forEach((name) => searchParams.delete(name));
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
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
 *
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
 * @param {string[]} colors
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
 *
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
 * @param {URLSearchParams} searchParams
 */
export function searchParamsToObject(searchParams) {
  /**
   * @type {Object<string, any>}
   */
  const params = {};
  for (const [key, val] of searchParams) {
    params[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  return params;
}

export function log() {
  const { log } = get(settings).Site;
  if (log) console.log(...arguments);
}

// @ts-ignore
Array.prototype.unique = function () {
  return this.filter((val, index, self) => self.indexOf(index) != val);
};

// @ts-ignore
Number.prototype.minDigits = function (minimumIntegerDigits, locale = 'de-DE', options) {
  return this.toLocaleString(locale, {
    minimumIntegerDigits,
    ...options
  });
};

// @ts-ignore
String.prototype.remove = function (val) {
  const arr = this.split(/\s+/);
  return (
    arr
      .filter((item) => item != val)
      // @ts-ignore
      .unique()
      .join(' ')
      .trim()
  );
};

// @ts-ignore
String.prototype.add = function (val) {
  let arr = this.split(' ');
  // @ts-ignore
  return arr.concat(val).unique().join(' ').trim();
};

export const __key__ = {};
export const __session__ = {};
