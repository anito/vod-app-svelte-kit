// @ts-nocheck
import { settings } from '$lib/stores';

let lifetime;
settings.subscribe((val) => (lifetime = val.Session?.lifetime));

export function get({ locals, request }) {
	const expires = new Date(Date.now() + parseInt(lifetime));

	console.log('LOCALS', locals);

	return {
		headers,
		body: {
			expires
		}
	};
}
