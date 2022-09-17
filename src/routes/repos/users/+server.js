import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ locals: { usersRepo, session }, url }) => {
  const token = session.data.user?.jwt;
  const limit = parseInt(url.searchParams.get('limit') || '250');
  const users = await usersRepo.getAll({ limit, token });

  return json({ users });
};
