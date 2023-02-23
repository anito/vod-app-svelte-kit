import type { Actions } from '@sveltejs/kit';

export const actions = {
  more: async ({ locals, cookies }) => {
    let pagination = JSON.parse(cookies.get('pagination') || '{}');
    const page = (pagination.users?.has_next_page && pagination.users?.current_page + 1) || 1;
    const users = await locals.usersRepo.getAll({
      page,
      token: locals.session.data.user?.jwt
    });
    const newPagination = { ...pagination, users: users.pagination };
    try {
      cookies.set('pagination', JSON.stringify(newPagination), { path: '/' });
    } catch (err) {
      console.log(err);
    }
    return users;
  }
} as Actions;
