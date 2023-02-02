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
      images: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...data
      }
    }),
    { path: '/' }
  );
}

const LIMIT = '9';

export const GET = async ({
  locals: { imagesRepo, session },
  url,
  cookies,
  request
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = getPagination(cookies);
  let countlimit: number;

  let images;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    images = await imagesRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && pagination.images) {
      const { current_page, count, limit }: any = pagination.images;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    images = await imagesRepo.getAll({ page, limit: countlimit, token }, cookies);
    if (images.pagination) setPagination(images.pagination, cookies);
  }
  return json(images);
};

export const POST = async ({ locals: { imagesRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const images = await imagesRepo.getAll({ match, token, limit });
  if (images.pagination) setPagination(images.pagination, cookies);

  return json(images);
};
