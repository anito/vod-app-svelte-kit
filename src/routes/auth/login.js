// @ts-nocheck
import * as api from '$lib/api';
import { locale as i18n } from 'svelte-i18n';

let locale;
i18n.subscribe((val) => (locale = val));

export async function post({ locals, request }) {
	let data = await request.json();
	const { token } = data;

	if (token) data = {}; // reset data if token has been received

	const saved = await locals.session.data;
	await locals.session.destroy();

	return await api.post(`users/login`, data, token).then(async (res) => {
		if (res.success) {
			await locals.session.set({
				user: res.data.user,
				groups: res.data.groups,
				role: res.data.user.group.name,
				locale: { locale, ...saved }
			});
		}

		return {
			body: { ...res }
		};
	});
}
