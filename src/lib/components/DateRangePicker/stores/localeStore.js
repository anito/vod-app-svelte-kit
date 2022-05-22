// @ts-nocheck
import { writable } from 'svelte/store';
import de from 'date-fns/locale/index.js';

function createStore() {
	const { subscribe, update, set } = writable(de, () => {});

	return {
		subscribe,
		update: (val) => update(() => val),
		set
	};
}

export const __locale__ = createStore();
