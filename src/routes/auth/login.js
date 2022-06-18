// @ts-nocheck
import * as api from '$lib/api';
import { locale } from 'svelte-i18n';

let lang;
locale.subscribe((val) => {
	console.log(val);
	lang = val;
});

export async function post({ locals, request }) {
	let data = await request.json();
	const { token } = data;

	// force JWT-Authentication if token is available
	if (token) data = void 0;

	return await api.post(`users/login?locale=${lang}`, data, token).then(async (res) => {
		if (res?.success) {
			const { id, name, jwt } = { ...res.data.user };
			await locals.session.destroy();
			await locals.session.set({
				user: { id, name, jwt },
				locale: lang
			});
			return {
				body: { ...res }
			};
		}
		return {
			status: 401,
			body: { ...res }
		};
	});
}
