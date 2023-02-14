import type { Session } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable({} as Session);

  return {
    update: (val: Session) =>
      update((items) => {
        return { ...items, ...val };
      }),
    subscribe,
    set
  };
}

export default createStore();
