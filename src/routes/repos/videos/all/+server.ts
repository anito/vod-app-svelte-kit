import { json } from '@sveltejs/kit';
import { paginationItems, setPaginationItem } from '$lib/utils';
import type { RequestEvent } from './$types';

const LIMIT = '9';

export const GET = async ({ locals: { videosAllRepo, session }, url }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  let countlimit: number;

  let videosAll;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    // we must use the normal videoRepo here since videoAllRepo doesn't have
    // a view action itself for fetching single entities
    videosAll = await videosAllRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && paginationItems.videosAll) {
      const { current_page, count, limit }: any = paginationItems.videos;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    videosAll = await videosAllRepo.getAll({ page, limit: countlimit, token });
    if (videosAll.pagination) setPaginationItem({ name: 'videosAll', data: videosAll.pagination });
  }

  return json(videosAll);
};

export const POST = async ({ locals: { videosAllRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const videosAll = await videosAllRepo.getAll({ match, token, limit });
  if (videosAll.pagination) setPaginationItem({ name: 'videosAll', data: videosAll.pagination });

  return json(videosAll);
};
