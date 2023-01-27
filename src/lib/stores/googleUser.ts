import type { GoogleUser } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({} as unknown as GoogleUser);

  return {
    subscribe,
    update: (val: GoogleUser) => update(() => val),
    set
  };
}
export default createStore();
