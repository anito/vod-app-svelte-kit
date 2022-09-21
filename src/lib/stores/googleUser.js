import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({});

  return {
    subscribe,
    /** @param {import('$lib/types').GoogleUser} val */
    update: (val) => update(() => val),
    set
  };
}
export default createStore();
