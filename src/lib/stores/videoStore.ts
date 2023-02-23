import type { Video } from '$lib/classes/repos/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Video[], () => {});

  let findIndexById = (id: string, items: Video[]) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    add: (values: Video[]) =>
      update((items) => {
        for (const value of values) {
          if (!items.find((item: Video) => value.id === item.id)) items = [...items, value];
        }
        return items;
      }),
    put: (val: Video) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm: Video) => itm.id !== id)),
    update: (val: Video[]) => update((items) => val),
    set
  };
}

export default createStore();
