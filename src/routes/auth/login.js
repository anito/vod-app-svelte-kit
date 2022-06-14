// @ts-nocheck
import * as api from '$lib/api';

export async function post({ locals, request }) {
	let data = await request.json();
	const { token } = data;

	if (token) data = {}; // reset data if token has been received

	const savedData = await locals.session.data();
	const { locale } = { locale: '', ...savedData };
	await locals.session.destroy();

	return await api.post(`users/login?locale=${locale}`, data, token).then(async (res) => {
		if (res?.success) {
			await locals.session.data({
				user: res.data.user,
				groups: res.data.groups,
				role: res.data.user.group.name,
				locale
			});
		}

		return {
			body: { ...res }
		};
	});
}
