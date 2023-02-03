import { json } from '@sveltejs/kit';
import { getPagination, setPaginationItem } from '$lib/utils';
import type { RequestEvent } from './$types';

const LIMIT = '8';

export const GET = async ({ locals: { usersRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = getPagination(cookies);
  let countlimit: number;

  let users;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    users = await usersRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && pagination.users) {
      const { current_page, count, limit }: any = pagination.users;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    users = await usersRepo.getAll({ page, limit: countlimit, token });
    if (users.pagination) setPaginationItem({ name: 'users', data: users.pagination, cookies });
  }
  return json(users);
};

export const POST = async ({ locals: { usersRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const users = await usersRepo.getAll({ match, token, limit });
  if (users.pagination) setPaginationItem({ name: 'users', data: users.pagination, cookies });

  return json(users);
};
