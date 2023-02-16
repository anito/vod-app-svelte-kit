import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { usersRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');

  let users;
  let id;
  if ((id = url.searchParams.get('id'))) {
    users = await usersRepo.get(id, { token });
  } else {
    let limit;
    if (url.searchParams.has('auto')) {
      const pagination = JSON.parse(cookies.get('pagination') || '{}');
      const { current_page, count, limit: _limit }: any = pagination.users;
      if (current_page && _limit && count) {
        limit = Math.min(current_page * _limit, count);
      }
    }
    users = await usersRepo.getAll({ page, limit, token });
  }
  return json(users);
};

export const POST = async ({ locals: { usersRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const options = await request.json(); // { match, limit, auto }
  if (options.auto) {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const { current_page, count, limit: _limit }: any = pagination.images;
    if (current_page && _limit && count) {
      options.limit = Math.min(current_page * _limit, count);
    }
  }
  const users = await usersRepo.getAll({ ...options, token });

  return json(users);
};
