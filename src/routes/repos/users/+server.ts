import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export const GET = async ({ locals: { usersRepo, session }, url }: RequestEvent) => {
  const { locale, user } = session.data;
  const token = user?.jwt;
  const page = url.searchParams.get('page') || 1;
  const limit = url.searchParams.get('limit') || 8;

  let users;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    users = await usersRepo.get(id, { locale, token });
  } else {
    users = await usersRepo.getAll({ page, limit, locale, token });
  }

  return json(users);
};
