import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ request, locals: { videosRepo, imagesRepo }, url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const videos = await videosRepo.getAll({ limit });
	const images = await imagesRepo.getAll({ limit });
	console.log(videos);
	console.log(images);

	return {
		body: { videos, images }
	};
};
