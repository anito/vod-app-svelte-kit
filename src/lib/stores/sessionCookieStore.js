import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable({});

  return {
    /** @param {import('$lib/types').Session} val */
    update: (val) => update(() => val),
    subscribe,
    set
  };
}

export default createStore();
