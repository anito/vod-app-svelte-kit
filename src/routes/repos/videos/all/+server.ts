import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { videosAllRepo, videosRepo, session },
  url
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const limit = url.searchParams.get('limit') || 10;

  let res;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    // we must use the normal videoRepo here since videoAllRepo doesn't have
    // a view action itself for fetching single entities
    res = await videosRepo.get(id, { token });
  } else {
    res = await videosAllRepo.getAll({ page, limit, token });
  }

  return json(res);
};

export const POST = async ({ locals: { videosAllRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videos = await videosAllRepo.getAll({ match, token, limit });

  return json(videos);
};
