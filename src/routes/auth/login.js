// @ts-nocheck
import * as api from '$lib/api';

export async function post({ locals, request }) {
	let data = await request.json();
	const { token } = data;

	if (token) data = {}; // reset data if token has been received

	return await api.post('users/login', data, token).then(async (res) => {
		await locals.session.destroy();
		await locals.session.data({
			user: res.data.user,
			groups: res.data.groups,
			role: res.data.user.group.name
		});

		return {
			body: { ...res }
		};
	});
}
