// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update, set } = writable([]);

	return {
		subscribe,
		update: (val) => update((_) => val),
		set
	};
}
export default createStore();
