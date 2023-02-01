import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { imagesRepo, session },
  url,
  cookies,
  request
}: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  let countlimit: number;
  // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
  if (url.searchParams.has('currentpage')) {
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      pagination.images;
    countlimit = Math.min(current_page * limit, count);
  } else {
    countlimit = parseInt(url.searchParams.get('limit') || '9');
  }

  let images;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    images = await imagesRepo.get(id, { token });
  } else {
    images = await imagesRepo.getAll({ page, limit: countlimit, token }, cookies);
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      images.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...pagination,
        images: {
          next_page: has_next_page ? current_page + 1 : undefined,
          ...images.pagination
        }
      }),
      { path: '/' }
    );
  }
  return json(images);
};

export const POST = async ({ locals: { imagesRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit: countlimit } = await request.json();
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  const images = await imagesRepo.getAll({ match, token, limit: countlimit });
  const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
    images.pagination;
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      images: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...images.pagination
      }
    }),
    { path: '/' }
  );

  return json(images);
};