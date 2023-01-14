import { users } from '$lib/stores';
import type { User } from '$lib/types';
import type { LayoutServerLoadEvent } from '../../routes/$types';

export const getAuxSession = () => {
  let _users: User[];
  users.subscribe((val) => (_users = val));
  return async ({ locals }: LayoutServerLoadEvent) => {
    const data = locals.session.data;
    const user = _users.find((user) => user.id === data.user?.id);
    if (!user) return data;
    return { ...data, user: { ...data.user, ...user } };
  };
};
