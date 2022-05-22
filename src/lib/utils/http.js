// @ts-nocheck
export function get(endpoint) {
  return fetch(endpoint, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
}

export function post(endpoint, data = {}) {
  return fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
}

export function del(endpoint, id) {
  return fetch(endpoint, {
    method: "DELETE",
    credentials: "include",
    body: id,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
}

export function put(endpoint, data = {}) {
  return fetch(endpoint, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
}