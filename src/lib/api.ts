import { dev } from '$app/environment';

export const base = dev ? `https://vod.mbp` : `https://vod.webpremiere.de`;
export const version = 'v1';

async function send(atts = {}) {
  const { method, path, token, data }: any = { ...atts };
  const url = path.startsWith('http') ? path : `${base}/${version}/${path}`;

  const opts = {
    method,
    headers: {
      Accept: 'application/json'
    } as {
      Accept: string;
      'Content-Type': string;
      Authorization: string;
    },
    credentials: 'include'
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
        console.log('API PARSE ERROR', err);
      }
    })
    .catch((err) => {
      console.log('API FETCH ERROR', err);
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
