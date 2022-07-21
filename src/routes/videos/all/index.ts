import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals: { videosAllRepo }, url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const videos = await videosAllRepo.getAll({ limit });

	return {
		body: { videos }
	};
};
