import { json, type Cookies } from '@sveltejs/kit';
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
      users: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...data
      }
    }),
    { path: '/' }
  );
}

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
    if (users.pagination) setPagination(users.pagination, cookies);
  }
  return json(users);
};

export const POST = async ({ locals: { usersRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const users = await usersRepo.getAll({ match, token, limit });
  if (users.pagination) setPagination(users.pagination, cookies);

  return json(users);
};
