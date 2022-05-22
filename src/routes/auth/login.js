// @ts-nocheck
import * as api from '$lib/api';

export async function post({ locals, request }) {
	const { email, password } = await request.json();

	return await api.post('users/login', { email, password }).then((response) => {
		locals.session.data = {
			user: response.data.user,
			groups: response.data.groups,
			role: response.data.user.group.name
		};

		return {
			body: { ...locals.session.data, success: response.success, message: response.data.message }
		};
	});
}
