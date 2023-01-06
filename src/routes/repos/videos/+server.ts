import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { videosRepo, session }, url }: RequestEvent) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const limit = url.searchParams.get('limit') || 6;

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosRepo.get(id, { locale, token });
  } else {
    videos = await videosRepo.getAll({ page, limit, locale, token });
  }

  return json(videos);
};
