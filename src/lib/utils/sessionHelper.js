// @ts-nocheck
import { users } from '$lib/stores';

let _users;
users.subscribe((val) => (_users = val));

export const getAuxSession = () => {
	return async (event) => {
		let data = event.locals.session.data;
		const user = _users.find((user) => user.id === data.user?.id);
		if (user && 1) {
			data = { ...data, user: { ...data.user, ...user } };
		}
		return data;
	};
};
