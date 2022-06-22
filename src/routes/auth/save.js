// @ts-nocheck

import * as api from '$lib/api';

export async function post({ locals, request }) {
	const { user } = await request.json();

	return await api
		.put(`users/${user.id}`, { data: { user }, token: user?.jwt })
		.then(async (res) => {
			await locals.session.set({
				...locals.session.data,
				user
			});
			return {
				body: { ...res }
			};
		});
}
