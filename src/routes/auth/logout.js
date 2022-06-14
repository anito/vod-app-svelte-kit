// @ts-nocheck

import * as api from '$lib/api.js';

export async function del({ locals, request }) {
	const { locale, user } = await locals.session.data();
	await locals.session.destroy();
	await locals.session.data({ locale });

	return await api
		.post(`users/logout?token=${user?.token}&locale=${locale}`)
		.then(async (response) => {
			return {
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(response)
			};
		});
}
