import { writable } from "svelte/store";

function createStore() {

	const { subscribe, update, set } = writable(false);

	return {
		subscribe,
		update: (val) => update(_ => val),
		set
	}
}
export const formGuard = createStore();