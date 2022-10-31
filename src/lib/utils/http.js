// @ts-nocheck
import { browser } from '$app/environment';

const credentials = browser ? 'include' : void 0;

export function get(endpoint) {
  return fetch(endpoint, {
    method: 'GET'
  })
    .then(async (r) => await r.json())
    .catch((reason) => console.error(reason));
}

export function post(endpoint, data = {}) {
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

export function del(endpoint, id) {
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

export function put(endpoint, data = {}) {
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
