// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update, set } = writable({});

	return {
		subscribe,
		update,
		dispatch: (items) => update((old) => items),
		set
	};
}

export default createStore();
