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
  const page = url.searchParams.get('page') || 1;
  const countlimit = url.searchParams.get('limit') || 8;

  let users;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    users = await usersRepo.get(id, { locale, token });
  } else {
    users = await usersRepo.getAll({ page, limit: countlimit, token });
    const pagination = cookies.get('pagination') || '{}';
    const { page_count, current_page, has_next_page, has_prev_page, count, limit }: any =
      users.pagination;
    cookies.set(
      'pagination',
      JSON.stringify({
        ...JSON.parse(pagination),
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

export const POST = async ({ locals: { usersRepo, session }, url, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const res = await usersRepo.getAll({ match, token, limit });

  return json(res);
};
