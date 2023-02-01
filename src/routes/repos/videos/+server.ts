import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { videosRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  let countlimit: number;
  // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
  if (url.searchParams.has('currentpage')) {
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      pagination.videos;
    countlimit = Math.min(current_page * limit, count);
  } else {
    countlimit = parseInt(url.searchParams.get('limit') || '9');
  }

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosRepo.get(id, { token });
  } else {
    videos = await videosRepo.getAll({ page, limit: countlimit, token });
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      videos.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...pagination,
        videos: {
          next_page: has_next_page ? current_page + 1 : undefined,
          ...videos.pagination
        }
      }),
      { path: '/' }
    );
  }
  return json(videos);
};

export const POST = async ({ locals: { videosRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit: countlimit } = await request.json();
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  const videos = await videosRepo.getAll({ match, token, limit: countlimit });
  const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
    videos.pagination;
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      videos: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...videos.pagination
      }
    }),
    { path: '/' }
  );

  return json(videos);
};
