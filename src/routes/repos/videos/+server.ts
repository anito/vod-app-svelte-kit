import { json } from '@sveltejs/kit';
import { paginationItems, setPaginationItem } from '$lib/utils';
import type { RequestEvent } from './$types';

const LIMIT = '9';

export const GET = async ({ locals: { videosRepo, session }, url }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  let countlimit: number;

  let videos;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    videos = await videosRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && paginationItems.videos) {
      const { current_page, count, limit }: any = paginationItems.videos;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    videos = await videosRepo.getAll({ page, limit: countlimit, token });
    if (videos.pagination) setPaginationItem({ name: 'videos', data: videos.pagination });
  }
  return json(videos);
};

export const POST = async ({ locals: { videosRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videos = await videosRepo.getAll({ match, token, limit });
  if (videos.pagination) setPaginationItem({ name: 'videos', data: videos.pagination });

  return json(videos);
};
