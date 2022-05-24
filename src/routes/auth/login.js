// @ts-nocheck
import * as api from '$lib/api';

export async function post({ locals, request }) {
	let data = await request.json();
	const { token } = data;
	console.log('AUTH:POST:data', data);

	if (token) data = {}; // reset data if token has been received

	return await api.post('users/login', data, token).then(async (response) => {
		console.log('SESSION.DATA', await locals.session.data());

		await locals.session.destroy();
		await locals.session.data({
			user: response.data.user,
			groups: response.data.groups,
			role: response.data.user.group.name
		});

		return {
			body: { ...response.data, success: response.success }
		};
	});
}
