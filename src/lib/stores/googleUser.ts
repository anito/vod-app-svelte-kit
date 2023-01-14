import type { GoogleUser } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({});

  return {
    subscribe,
    update: (val: GoogleUser) => update(() => val),
    set
  };
}
export default createStore();
