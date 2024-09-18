import { browser, dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getBlob } from './utils';

export const base = dev ? 'https://vod.mbp' : 'https://vod.webpremiere.de';
export const api_path = '/api/v1';

async function send(atts: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  token?: string;
  data?: any;
}) {
  const { method, path, token, data } = { ...atts };
  const url = path.startsWith('http') ? path : `${base}${api_path}/${path}`;
  const useBlob = method === 'GET' && browser && false; // don't use blob for now

  if (useBlob) {
    return getBlob(url, token);
  }

  const opts = {
    method,
    headers: {
      Accept: 'application/json',
    } as {
      Accept: string;
      'Content-Type': string;
      Authorization?: string;
    },
    credentials: 'include',
  } as {
    method: string;
    body: string;
    headers: any;
    credentials: RequestCredentials | undefined;
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
      return res.text();
    })
    .then((res) => {
      try {
        return JSON.parse(res);
      } catch (err) {
        console.error('[API PARSE]', err);
      }
    })
    .catch((err) => {
      console.log(err);
      error(500, 'API Server Error');
    });
}

export function get(path: string, options = {}) {
  return send({ method: 'GET', path, ...options });
}

export function del(path: string, options = {}) {
  return send({ method: 'DELETE', path, ...options });
}

export function post(path: string, options = {}) {
  return send({ method: 'POST', path, ...options });
}

export function put(path: string, options = {}) {
  return send({ method: 'PUT', path, ...options });
}
