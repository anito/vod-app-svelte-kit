import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    update: (/** @type {never[]} */ val) => update((items) => val),
    set
  };
}

export default createStore();
