import { get } from 'svelte/store';
import * as api from '$lib/api';
import { urls } from '$lib/stores';
import { log } from '$lib/utils';

const MediaTypes = new Map([
  ['VIDEO', { base: 'v' }],
  ['IMAGE', { base: 'i' }],
  ['AVATAR', { base: 'a' }]
]);

/**
 *
 * @param {string} id
 * @param {import('$lib/types').User} user
 * @param {string} type
 * @param {any} param3
 * @returns
 */
async function uri(id, user, type, { ...options }) {
  /** @type {{base: string} | any} */
  const { base } = MediaTypes.get(type);
  let query = [];
  for (var key in options) {
    query.push(`${key}=${options[key]}`);
  }
  const url = `u/${base}/${id}/${query.length && '?' + query.join('&')}`;

  return await api.get(`${url}`, { token: user?.jwt, fetch }).then((res) => {
    if (res?.success) {
      return res.data;
    } else {
      throw `The Uri method was unable to fetch a mediafile type: ${type || 'unknown'}, id: ${id}`;
    }
  });
}

/**
 *
 * @param {string} type
 * @param {string} id
 * @param {import('$lib/types').User} user
 * @param {any} param3
 * @returns
 */
export async function getMedia(type, id, user, { ...options }) {
  if (user?.jwt) {
    let defaults = {
      width: 300,
      height: 300,
      square: 0,
      quality: -1
    };
    const params = { ...defaults, ...options };
    let cached, url, _urls, stringified;
    stringified = JSON.stringify(params).replace(/["'\s]/g, '');

    url = cached = ((_urls = get(urls)) && _urls.has(id) && _urls.get(id)[stringified]) || false;

    if (!cached) {
      await uri(id, user, type, params)
        .then((res) => (url = res['url']) && urls.add(res))
        .catch((err) => log(err));
    }
    if (url) return `${url}/?token=${user.jwt}`;
  }
}

/**
 *
 * @param {string} id
 * @param {import('$lib/types').User} user
 * @param {any} options
 * @returns
 */
export function getMediaAvatar(id, user, options = {}) {
  const defaults = {
    width: 100,
    height: 100,
    square: 1
  };
  let settings = { ...defaults, ...options };
  return getMedia('AVATAR', id, user, settings);
}

/**
 *
 * @param {string} id
 * @param {import('$lib/types').User} user
 * @param {any} options
 * @returns
 */
export function getMediaImage(id, user, options = {}) {
  const defaults = {
    width: 512,
    height: 512,
    square: 0
  };
  let settings = { ...defaults, ...options };
  return getMedia('IMAGE', id, user, settings);
}

/**
 *
 * @param {string} id
 * @param {import('$lib/types').User} user
 * @param {any} options
 * @returns
 */
export async function getMediaVideo(id, user, options = {}) {
  const defaults = { square: 2 };
  let settings = { ...defaults, ...options };
  return getMedia('VIDEO', id, user, settings);
}

/**
 *
 * @param {*} fn
 * @returns
 */
export function getExt(fn) {
  let match = fn?.match(/[A-Za-z0-9]+$/) || [];
  return match.length && match[0].toLowerCase();
}
