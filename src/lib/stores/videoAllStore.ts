import type { VideoAll } from '$lib/classes/repos/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as VideoAll[], () => {});

  return {
    subscribe,
    add: (values: VideoAll[]) =>
      update((items) => {
        for (const value of values) {
          if (!items.find((item) => value.id === item.id)) items = [...items, value];
        }
        return items;
      }),
    update: (val: VideoAll[]) => update(() => val),
    set
  };
}

export default createStore();
