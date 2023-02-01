import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { videosAllRepo, videosRepo, session },
  url,
  cookies
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  let countlimit: number;
  // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
  if (url.searchParams.has('currentpage')) {
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      pagination.videosAll;
    countlimit = Math.min(current_page * limit, count);
  } else {
    countlimit = parseInt(url.searchParams.get('limit') || '9');
  }

  let videosAll;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    // we must use the normal videoRepo here since videoAllRepo doesn't have
    // a view action itself for fetching single entities
    videosAll = await videosRepo.get(id, { token });
  } else {
    videosAll = await videosAllRepo.getAll({ page, limit: countlimit, token });
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      videosAll.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...pagination,
        videosAll: {
          next_page: has_next_page ? current_page + 1 : undefined,
          ...videosAll.pagination
        }
      }),
      { path: '/' }
    );
  }

  return json(videosAll);
};

export const POST = async ({
  locals: { videosAllRepo, session },
  request,
  cookies
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit: countlimit } = await request.json();
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  const videosAll = await videosAllRepo.getAll({ match, token, limit: countlimit });
  const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
    videosAll.pagination;
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      videosAll: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...videosAll.pagination
      }
    }),
    { path: '/' }
  );

  return json(videosAll);
};
