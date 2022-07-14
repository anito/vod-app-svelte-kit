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
				const { expires } = { ...item };
				clearTimeout(timeoutId);
				// removing the message after expiration time
				if (!isNaN(expires)) {
					timeoutId = setTimeout((msg) => set(msg), expires, {
						message
					});
				}
				return { type, message, ...item };
			}),
		text: (message) => update((val) => ({ ...val, message })),
		set
	};
}

export default createStore();
