// @ts-nocheck
import * as api from '$lib/api.js';
import { get } from 'svelte/store';
import { settings } from '$lib/stores';
import { locale } from 'svelte-i18n';

let base;

settings.subscribe((val) => (base = val.api));

export function post(req, res) {
	const user = req.body;

	api.post('users', { user }).then((response) => {
		if (response.user) {
			req.session.user = response.user;
		}

		res.setHeader('Content-Type', 'application/json');

		res.end(JSON.stringify(response));
	});
}
