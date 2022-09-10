// @ts-nocheck
import { users } from '$lib/stores';

export const getAuxSession = () => {
	let _users;
	users.subscribe((val) => (_users = val));
	return async (event) => {
		const data = event.locals.session.data;
		const user = _users.find((user) => user.id === data.user?.id);
		// console.log('getSession...', user ? user.name : 'no user yet');
		if (!user) return data;
		return { ...data, user: { ...data.user, ...user } };
	};
};
