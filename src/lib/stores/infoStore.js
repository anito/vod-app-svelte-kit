// @ts-nocheck
import { derived } from 'svelte/store';
import { default as users } from './userStore';
import { isExpired } from '$lib/utils';

function createStore() {
	function hasActiveVideos(usr) {
		let end,
			active,
			now = new Date();
		return usr.videos?.reduce((cum, cur) => {
			active = (end = cur._joinData.end) && new Date(end) > now;
			return cum || active;
		}, false);
	}
	const infos = new Map();
	const DEFS = [
		{
			key: {
				id: 'account-inaccessible',
				eventType: 'INFO:open:ResolveAllDialog',
				label: 'text.content-inaccessible',
				flag: 'warning',
				type: ''
			},
			value: (usr) =>
				hasActiveVideos(usr) && (!usr.jwt || !usr.active || (usr.expires && isExpired(usr.expires)))
		},
		{
			key: {
				id: 'token-expired',
				eventType: 'INFO:token:Generate',
				label: 'text.regenerate-expired-token',
				flag: 'flash',
				type: 'issue'
			},
			value: (usr) => usr.expires && isExpired(usr.expires)
		},
		{
			key: {
				id: 'user-inactive',
				eventType: 'INFO:user:Activate',
				label: 'text.activate-user',
				flag: 'flash',
				type: 'issue'
			},
			value: (usr) => !usr.active
		},
		{
			key: {
				id: 'token-missing',
				eventType: 'INFO:token:Generate',
				label: 'text.generate-token',
				flag: 'flash',
				type: 'issue'
			},
			value: (usr) => !usr.jwt
		}
	];

	return derived(users, ($users, set) => {
		for (let user of $users) {
			let res = [];
			for (const def of DEFS) {
				def.value(user) && res.push(def.key);
			}
			let item = infos.get(user.id);
			(item && ((res.length && (item.params = [...res])) || infos.delete(user.id))) ||
				(res.length &&
					infos.set(user.id, {
						params: res
					}));
		}
		set(infos);
	});
}

export default createStore();
