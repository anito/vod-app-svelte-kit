import { get } from 'svelte/store';
import * as api from '$lib/api';
import { urls } from '$lib/stores';
import { buildSearchParams, log } from '$lib/utils';

const MediaTypes = new Map([
  ['VIDEO', { base: 'v' }],
  ['IMAGE', { base: 'i' }],
  ['AVATAR', { base: 'a' }]
]);

async function uri(id: any, token: any, type: string, { ...options }) {
  const base = MediaTypes.get(type)?.base;
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

export async function getMedia(
  type: string,
  id: any,
  token: string,
  { ...options }: { width?: number; height?: number; square: number }
) {
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

export function getMediaAvatar(id: any, jwt: string, options = {}) {
  const defaults = {
    width: 100,
    height: 100,
    square: 1
  };
  let settings = { ...defaults, ...options };
  return getMedia('AVATAR', id, jwt, settings);
}

export function getMediaImage(id: any, jwt: string, options = {}) {
  const defaults = {
    width: 512,
    height: 512,
    square: 0
  };
  let settings = { ...defaults, ...options };
  return getMedia('IMAGE', id, jwt, settings);
}

export async function getMediaVideo(id: any, jwt: string, options = {}) {
  const defaults = { square: 2 };
  let settings = { ...defaults, ...options };
  return getMedia('VIDEO', id, jwt, settings);
}

export function getExt(fn: { match: (arg0: RegExp) => string[] }) {
  let match = fn?.match(/[A-Za-z0-9]+$/) || [];
  return (match.length && match[0].toLowerCase()) || undefined;
}
