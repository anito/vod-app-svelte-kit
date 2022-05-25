// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update, set } = writable({
		Session: {
			lifetime: 4 * 60 * 60 * 1000
		}
	});

	return {
		subscribe,
		update: (val) =>
			update((current) => {
				let cur,
					ret = {};
				for (let item in val) {
					ret[item] = (cur = current[item] || {}) && { ...cur, ...val[item] };
				}
				return ret;
			}),
		set
	};
}
export const settings = createStore();
