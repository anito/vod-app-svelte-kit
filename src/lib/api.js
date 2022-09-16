// @ts-nocheck
import { browser, dev } from '$app/environment';
import { locale as i18n } from 'svelte-i18n';

let locale;
i18n.subscribe((val) => (locale = val));

export const base = dev ? `https://physio.mbp/v1` : `https://vod.webpremiere.de/v1`;

async function send(atts = {}) {
  if (browser) atts = { fetch: window.fetch, ...atts };
  const { method, path, token, fetch, data } = { ...atts };
  let fullpath = path.startsWith('http') ? path : `${base}/${path}`;

  const opts = {
    method,
    headers: {
      Accept: 'application/json',
      'Accept-Language': locale
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

  return fetch(`${fullpath}`, opts)
    .then((res) => res.text())
    .then((res) => {
      try {
        return JSON.parse(res);
      } catch (error) {}
    })
    .catch((err) => {
      console.log('API FETCH ERROR', err);
    });
}

export function get(path, options) {
  return send({ method: 'GET', path, ...options });
}

export function del(path, options) {
  return send({ method: 'DELETE', path, ...options });
}

export function post(path, options) {
  return send({ method: 'POST', path, ...options });
}

export function put(path, options) {
  return send({ method: 'PUT', path, ...options });
}
