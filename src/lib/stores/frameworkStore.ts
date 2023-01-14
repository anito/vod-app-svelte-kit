import type { Framework } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({} as Framework);

  return {
    subscribe,
    update: (val: Framework<Record<string, any>>) => update((_) => val),
    set
  };
}
export default createStore();
