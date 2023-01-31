import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { imagesRepo, session },
  url,
  cookies,
  request
}: RequestEvent) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const countlimit = url.searchParams.get('limit') || 9;

  let images;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    images = await imagesRepo.get(id, { locale, token });
  } else {
    images = await imagesRepo.getAll({ page, limit: countlimit, locale, token }, cookies);
    const pagination = cookies.get('pagination') || '{}';
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      images.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...JSON.parse(pagination),
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
