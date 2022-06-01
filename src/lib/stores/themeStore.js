import { writable } from 'svelte/store';

function createStore() {
	const { update, subscribe, set } = writable({
		primary: '',
		secondary: ''
	});

	return {
		subscribe,
		update,
		set
	};
}

export default createStore();
