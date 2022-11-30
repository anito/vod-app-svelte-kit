import { users } from '$lib/stores';

export const getAuxSession = () => {
  /**
   * @type {import('$lib/types').User[]}
   */
  let _users;
  users.subscribe((val) => (_users = val));
  return async (/** @type {{ locals: { session: { data: any; }; }; }} */ event) => {
    const data = event.locals.session.data;
    const user = _users.find((user) => user.id === data.user?.id);
    if (!user) return data;
    return { ...data, user: { ...data.user, ...user } };
  };
};
