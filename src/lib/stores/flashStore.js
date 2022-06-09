// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
	const type = 'success';
	const message = '';
	const { subscribe, update, set } = writable({}, () => {});
	let timeoutId;

	return {
		subscribe,
		update: (item) =>
			update((_) => {
				const { timeout } = { ...item };
				clearTimeout(timeoutId);
				// removing the message after timeout
				if (!isNaN(timeout)) {
					timeoutId = setTimeout((msg) => set(msg), timeout, {
						message
					});
				}
				return { type, message, ...item };
			}),
		set
	};
}

export default createStore();
