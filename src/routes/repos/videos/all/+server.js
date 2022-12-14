import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ locals: { videosAllRepo, session }, url }) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const limit = url.searchParams.get('limit') || 250;
  const videos = await videosAllRepo.getAll({ locale, limit, token });

  return json(videos);
};
