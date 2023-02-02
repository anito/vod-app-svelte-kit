import { json, type Cookies } from '@sveltejs/kit';
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
      videos: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...data
      }
    }),
    { path: '/' }
  );
}

const LIMIT = '9';

export const GET = async ({ locals: { videosRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = getPagination(cookies);
  let countlimit: number;

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && pagination.videos) {
      const { current_page, count, limit }: any = pagination.videos;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    videos = await videosRepo.getAll({ page, limit: countlimit, token });
    if (videos.pagination) setPagination(videos.pagination, cookies);
  }
  return json(videos);
};

export const POST = async ({ locals: { videosRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videos = await videosRepo.getAll({ match, token, limit });
  if (videos.pagination) setPagination(videos.pagination, cookies);

  return json(videos);
};
