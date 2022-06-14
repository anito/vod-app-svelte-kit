// @ts-nocheck
import * as api from '$lib/api';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';

export function post(req, res) {
	let user = req.body.user;
	let fields = req.body.fields;
	fields = typeof fields === 'array' ? fields : !!fields ? [fields] : [];

	api.put(`users/${user.id}`, { user }, req.session.user.token).then((response) => {
		if (response?.success && response?.data) {
			fields.map((field) => (req.session.user[field] = response.data[field]));
		}
		res.setHeader('Content-Type', 'application/json');

		// extend response for sapper session store by cookie expiration time for later use with session ticker
		res.end(JSON.stringify({ ...response, expires: req.session.cookie.expires }));
	});
}
