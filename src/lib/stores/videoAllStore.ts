import type { Video } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Video[], () => {});

  return {
    subscribe,
    add: (values: Video[]) =>
      update((items) => {
        for (const value of values) {
          if (!items.find((item) => value.id === item.id)) items = [...items, value];
        }
        return items;
      }),
    update: (val: Video[]) => update(() => val),
    set
  };
}

export default createStore();
