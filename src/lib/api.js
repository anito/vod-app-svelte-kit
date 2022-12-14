import { dev, browser } from '$app/environment';
import { get as getStore } from 'svelte/store';
import { locale } from 'svelte-i18n';
import { bodyReader } from '$lib/utils';

export const base = dev ? `https://vod.mbp/v1` : `https://vod.webpremiere.de/v1`;

async function send(atts = {}) {
  /**
   * @type {any}
   */
  const { method, path, token, data } = { ...atts };
  let url = path.startsWith('http') ? path : `${base}/${path}`;

  /**
   * @type {any}
   */
  const opts = {
    method,
    headers: {
      Accept: 'application/json'
    },
    credentials: 'include'
  };

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${url}`, opts)
    .then(async (res) => {
      if (opts.useReader) {
        return bodyReader(res);
      } else {
        return res.text();
      }
    })
    .then((res) => {
      try {
        return JSON.parse(res);
      } catch (err) {
        console.log('API PARSE ERROR', err);
      }
    })
    .catch((err) => {
      console.log('API FETCH ERROR', err);
    });
}

/**
 * @param {string} path
 * @param {{} | undefined} [options]
 */
export function get(path, options = {}) {
  return send({ method: 'GET', path, ...options });
}

/**
 * @param {string} path
 * @param {{} | undefined} [options]
 */
export function del(path, options = {}) {
  return send({ method: 'DELETE', path, ...options });
}

/**
 * @param {string} path
 * @param {{} | undefined} options
 */
export function post(path, options = {}) {
  return send({ method: 'POST', path, ...options });
}

/**
 * @param {string} path
 * @param {{} | undefined} options
 */
export function put(path, options = {}) {
  return send({ method: 'PUT', path, ...options });
}
