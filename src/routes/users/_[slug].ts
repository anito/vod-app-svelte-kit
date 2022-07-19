import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ request, locals: { usersRepo }, url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const users = await usersRepo.getAll({ limit });

	return {
		body: { users }
	};
};
