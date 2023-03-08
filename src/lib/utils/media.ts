import { get } from 'svelte/store';
import * as api from '$lib/api';
import { urls } from '$lib/stores';
import { buildSearchParams } from '$lib/utils';

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
    try {
      if (res?.success) {
        return res.data;
      } else {
        throw `The Uri method was unable to fetch a mediafile type: ${
          type || 'unknown'
        }, id: ${id}`;
      }
    } catch (error) {
      console.error('[FETCH MEDIA]', error);
    }
  });
}

async function getMedia(
  type: string,
  id: string,
  token: string,
  params: { width?: number; height?: number; square?: number; video?: boolean }
) {
  if (token) {
    let cached;
    let url;
    let _urls;
    const stringified = JSON.stringify(params).replace(/["'\s]/g, '');

    url = cached = ((_urls = get(urls)) && _urls.has(id) && _urls.get(id)[stringified]) || false;

    if (!cached) {
      url = await uri(id, token, type, params).then((res) => {
        if (res) {
          urls.add(res);
          return res['url'];
        }
      });
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

export async function getMediaVideo(id: any, jwt: string) {
  return getMedia('VIDEO', id, jwt, { video: true });
}

export function getExt(name: string | undefined) {
  let match = name?.match(/[A-Za-z0-9]+$/) || [];
  return String(match.length && match[0]).toLowerCase() || undefined;
}
