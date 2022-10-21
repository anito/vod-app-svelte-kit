import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ locals: { videosAllRepo, session }, url }) => {
  const token = session.data.user?.jwt;
  const limit = parseInt(url.searchParams.get('limit') || '250');
  const videos = await videosAllRepo.getAll({ limit, token });

  return json(videos);
};
