import { browser } from '$app/environment';
import { register } from './reader';

const credentials = browser ? 'include' : void 0;

export function get(endpoint: RequestInfo | URL) {
  return fetch(endpoint, {
    method: 'GET'
  })
    .then(async (r) => await r.json())
    .catch((reason) => console.error(reason));
}

export function post(endpoint: RequestInfo | URL, data = {}) {
  return fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (r) => await r.json())
    .catch((reason) => console.error(reason));
}

export function del(endpoint: RequestInfo | URL, id: any) {
  return fetch(endpoint, {
    method: 'DELETE',
    credentials,
    body: id,
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (r) => await r.json())
    .catch((reason) => console.error(reason));
}

export function put(endpoint: RequestInfo | URL, data = {}) {
  return fetch(endpoint, {
    method: 'PUT',
    credentials,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (r) => await r.json())
    .catch((reason) => console.error(reason));
}

export function getBlob(url: string, token?: string) {
  const { start } = register({ url });
  return start(token)?.then(async (res: any) => {
    const text = await res.blob.text();
    return JSON.parse(text);
  });
}
