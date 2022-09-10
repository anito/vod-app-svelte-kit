// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable({});

  return {
    update: (val) => update(() => val),
    subscribe,
    set
  };
}

export default createStore();
