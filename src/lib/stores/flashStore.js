// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const type = 'success';
	const status = '';
	const message = '';
	const { subscribe, update, set } = writable({}, () => {});
	let timeoutId;

	return {
		subscribe,
		update: (item) =>
			update((_) => {
				const { timeout } = { ...item };
				clearTimeout(timeoutId);
				// setting and removing the message after amount of time
				if (timeout) {
					timeoutId = setTimeout((msg) => set(msg), timeout, {
						message
					});
				}
				return { type, status, message, ...item };
			}),
		set
	};
}

export default createStore();
