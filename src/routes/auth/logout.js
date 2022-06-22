// @ts-nocheck

import * as api from '$lib/api.js';

export async function del({ locals, request }) {
	const locale = locals.session.data.locale;
	await locals.session.destroy();
	// re-save locale to session
	if (locale) {
		await locals.session.set({ locale });
	}

	return await api.post(`users/logout?locale=${locale}`, { fetch }).then((res) => {
		return {
			body: { ...res }
		};
	});
}
