import { writable } from 'svelte/store';
import type { Session } from '$lib/types';

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
