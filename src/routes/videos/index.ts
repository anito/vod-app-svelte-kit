import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals: { videosRepo, imagesRepo }, url }) => {
  const limit = parseInt(url.searchParams.get('limit') || '250');
  const videos = await videosRepo.getAll({ limit });
  const images = await imagesRepo.getAll({ limit });

  return {
    body: { videos, images }
  };
};
