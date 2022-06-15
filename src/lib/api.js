// @ts-nocheck
import { dev } from '$app/env';

export const base = dev ? 'http://localhost:8765/api' : 'https://vod.webpremiere.de/api';
// export const base = dev ? 'https://physio.mbp/api' : 'https://vod.webpremiere.de/api';

async function send({ method, path, data, token }) {
	const fullpath = path.startsWith('http') ? path : `${base}/${path}`;

	const opts = {
		method,
		headers: {
			Accept: 'application/json' // make cakephp happy (required for ajax-rendering)
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

	return fetch(fullpath, opts)
		.then((res) => res.text())
		.then((res) => {
			try {
				return JSON.parse(res);
			} catch (_) {}
		})
		.catch((_) => {});
}

export function get(path, token) {
	return send({ method: 'GET', path, token });
}

export function del(path, token) {
	return send({ method: 'DELETE', path, token });
}

export function post(path, data = {}, token) {
	return send({ method: 'POST', path, data, token });
}

export function put(path, data = {}, token) {
	return send({ method: 'PUT', path, data, token });
}
