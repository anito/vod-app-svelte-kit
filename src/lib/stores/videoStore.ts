import type { Video } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Video[], () => {});

  let findIndexById = (id: any, items: any[]) => {
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
    put: (val: { id: any }) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: any) => update((items) => items.filter((itm: { id: any }) => itm.id !== id)),
    update: (val: any) => update((items) => val),
    set
  };
}

export default createStore();
