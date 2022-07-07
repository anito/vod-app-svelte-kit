// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update, set } = writable({});

	return {
		subscribe,
		update,
		dispatch: (val) => update(() => val),
		set
	};
}

export default createStore();
