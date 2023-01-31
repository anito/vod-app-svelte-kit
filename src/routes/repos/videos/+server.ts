import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { videosRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const pagelimit = url.searchParams.get('limit') || 9;

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosRepo.get(id, { token });
  } else {
    videos = await videosRepo.getAll({ page, limit: pagelimit, token });
    const pagination = cookies.get('pagination') || '{}';
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      videos.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...JSON.parse(pagination),
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

export const POST = async ({ locals: { videosRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videos = await videosRepo.getAll({ match, token, limit });

  return json(videos);
};
