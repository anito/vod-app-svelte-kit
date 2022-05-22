// @ts-nocheck

import { settings } from '$lib/stores';

let lifetime;
settings.subscribe((val) => (lifetime = val.Session?.lifetime));

export async function post({ request }) {
	const { user, groups } = await request.json();
	const expires = new Date(Date.now() + parseInt(lifetime));

	return {
		status: 303,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user,
			groups,
			expires
		})
	};
}
