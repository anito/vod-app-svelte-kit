// @ts-nocheck

import * as api from '$lib/api.js';

export async function del({ locals, request }) {
	const saved = await locals.session.data;
	const { locale, user } = { locale: '', ...saved };
	await locals.session.destroy();
	await locals.session.set({ locale });

	return await api
		.post(`users/logout?token=${user?.jwt}&locale=${locale}`)
		.then(async (response) => {
			return {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(response)
			};
		});
}
