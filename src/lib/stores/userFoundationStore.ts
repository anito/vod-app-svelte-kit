import type { UserFoundation } from '$lib/classes/repos/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable(null as UserFoundation[] | null);

  return {
    subscribe,
    update: (val: UserFoundation<Record<any, any>>[]) => update(() => val),
    set
  };
}

export default createStore();
