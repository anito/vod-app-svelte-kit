import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { imagesRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');

  let images;
  let id;
  if ((id = url.searchParams.get('id'))) {
    images = await imagesRepo.get(id, { token });
  } else {
    let limit;
    if (url.searchParams.has('auto')) {
      const pagination = JSON.parse(cookies.get('pagination') || '{}');
      const { current_page, count, limit: _limit }: any = pagination.images;
      if (current_page && _limit && count) {
        limit = Math.min(current_page * _limit, count);
      }
    }
    images = await imagesRepo.getAll({ page, limit, token });
  }
  return json(images);
};

export const POST = async ({ locals: { imagesRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const options = await request.json(); // { match, limit, auto }
  if (options.auto) {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const { current_page, count, limit }: any = pagination.images;
    if (current_page && limit && count) {
      options.limit = Math.min(current_page * limit, count);
    }
  }
  const images = await imagesRepo.getAll({ ...options, token });
  return json(images);
};
