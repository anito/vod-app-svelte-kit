import { get } from 'svelte/store';
import * as api from '$lib/api';
import { urls } from '$lib/stores';
import { buildSearchParams, log } from '$lib/utils';

const MediaTypes = new Map([
  ['VIDEO', { base: 'v' }],
  ['IMAGE', { base: 'i' }],
  ['AVATAR', { base: 'a' }]
]);

/**
 *
 * @param {string} id
 * @param {string} token
 * @param {string} type
 * @param {any} param3
 * @returns {Promise<any>}
 */
async function uri(id, token, type, { ...options }) {
  /** @type {{base: string} | any} */
  const { base } = MediaTypes.get(type);
  const searchParam = buildSearchParams(options);
  const url = `u/${base}/${id}${searchParam}`;

  return await api.get(`${url}`, { token }).then((res) => {
    if (res?.success) {
      return res.data;
    } else {
      throw `The Uri method was unable to fetch a mediafile type: ${type || 'unknown'}, id: ${id}`;
    }
  });
}

/**
 * @param {string} type
 * @param {string} id
 * @param {string} token
 * @param {{width?: number, height?: number, square?: number, quality?: number}} param3
 * @returns {Promise<string | undefined>}
 */
export async function getMedia(type, id, token, { ...options }) {
  if (token) {
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
      await uri(id, token, type, params)
        .then((res) => (url = res['url']) && urls.add(res))
        .catch((err) => log(err));
    }
    if (url) return `${url}/?token=${token}`;
  }
}

/**
 *
 * @param {string} id
 * @param {string} jwt
 * @param {any} options
 * @returns {Promise<string | undefined>}
 */
export function getMediaAvatar(id, jwt, options = {}) {
  const defaults = {
    width: 100,
    height: 100,
    square: 1
  };
  let settings = { ...defaults, ...options };
  return getMedia('AVATAR', id, jwt, settings);
}

/**
 *
 * @param {string} id
 * @param {string} jwt
 * @param {any} options
 * @returns {Promise<string | undefined>}
 */
export function getMediaImage(id, jwt, options = {}) {
  const defaults = {
    width: 512,
    height: 512,
    square: 0
  };
  let settings = { ...defaults, ...options };
  return getMedia('IMAGE', id, jwt, settings);
}

/**
 *
 * @param {string} id
 * @param {string} jwt
 * @param {any} options
 * @returns {Promise<string | undefined>}
 */
export async function getMediaVideo(id, jwt, options = {}) {
  const defaults = { square: 2 };
  let settings = { ...defaults, ...options };
  return getMedia('VIDEO', id, jwt, settings);
}

/**
 *
 * @param {*} fn
 * @returns {string | undefined}
 */
export function getExt(fn) {
  let match = fn?.match(/[A-Za-z0-9]+$/) || [];
  return (match.length && match[0].toLowerCase()) || undefined;
}
