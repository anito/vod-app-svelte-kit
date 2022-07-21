import * as api from '$lib/api';

export const get = async ({ locals: { usersRepo, session }, url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	// const users = await usersRepo.getAll({ limit });
	const users = await api.get('users', { fetch, token: session.data.user.jwt }).then((res) => {
		return res.data;
	});

	return {
		body: { users }
	};
};
