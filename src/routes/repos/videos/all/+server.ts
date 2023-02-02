import { error, json, type Cookies } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

function getPagination(cookies: Cookies) {
  return JSON.parse(cookies.get('pagination') || '{}');
}

function setPagination(data: any, cookies: Cookies) {
  const pagination = getPagination(cookies);
  const { current_page, has_next_page }: any = data || {};
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      videosAll: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...data
      }
    }),
    { path: '/' }
  );
}

const LIMIT = '9';

export const GET = async ({ locals: { videosAllRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = getPagination(cookies);
  let countlimit: number;

  let videosAll;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    // we must use the normal videoRepo here since videoAllRepo doesn't have
    // a view action itself for fetching single entities
    videosAll = await videosAllRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && pagination.videosAll) {
      const { current_page, count, limit }: any = pagination.videos;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    videosAll = await videosAllRepo.getAll({ page, limit: countlimit, token });
    if (videosAll.pagination) setPagination(videosAll.pagination, cookies);
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
  const { match, limit } = await request.json();
  const videosAll = await videosAllRepo.getAll({ match, token, limit });
  if (videosAll.pagination) setPagination(videosAll.pagination, cookies);

  return json(videosAll);
};
