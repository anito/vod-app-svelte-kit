// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const { subscribe, update, set } = writable([], () => {});

	return {
		subscribe,
		update: (val) => update((items) => val),
		set
	};
}

export default createStore();
