import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({
  locals: { usersRepo, session },
  url,
  cookies,
  request
}: RequestEvent) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  let countlimit: number;
  // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
  if (url.searchParams.has('currentpage')) {
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      pagination.users;
    countlimit = Math.min(current_page * limit, count);
  } else {
    countlimit = parseInt(url.searchParams.get('limit') || '8');
  }

  let users;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    users = await usersRepo.get(id, { locale, token });
  } else {
    users = await usersRepo.getAll({ page, limit: countlimit, token });
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      users.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...pagination,
        users: {
          next_page: has_next_page ? current_page + 1 : undefined,
          ...users.pagination
        }
      }),
      { path: '/' }
    );
  }
  return json(users);
};

export const POST = async ({ locals: { usersRepo, session }, request, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit: countlimit } = await request.json();
  const pagination = JSON.parse(cookies.get('pagination') || '{}');
  const users = await usersRepo.getAll({ match, token, limit: countlimit });
  const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
    users.pagination;
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      users: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...users.pagination
      }
    }),
    { path: '/' }
  );

  return json(users);
};
