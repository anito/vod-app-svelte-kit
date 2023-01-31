import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { videosAllRepo, videosRepo, session },
  url,
  cookies
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const countlimit = url.searchParams.get('limit') || 10;

  let videosAll;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    // we must use the normal videoRepo here since videoAllRepo doesn't have
    // a view action itself for fetching single entities
    videosAll = await videosRepo.get(id, { token });
  } else {
    videosAll = await videosAllRepo.getAll({ page, limit: countlimit, token });
    const pagination = cookies.get('pagination') || '{}';
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      videosAll.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...JSON.parse(pagination),
        users: {
          next_page: has_next_page ? current_page + 1 : undefined,
          ...videosAll.pagination
        }
      }),
      { path: '/' }
    );
  }

  return json(videosAll);
};

export const POST = async ({ locals: { videosAllRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videos = await videosAllRepo.getAll({ match, token, limit });

  return json(videos);
};
