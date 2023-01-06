import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { videosAllRepo, session }, url }: RequestEvent) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const limit = url.searchParams.get('limit') || 10;

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosAllRepo.get(id, { locale, token });
  } else {
    videos = await videosAllRepo.getAll({ page, limit, locale, token });
  }

  return json(videos);
};
