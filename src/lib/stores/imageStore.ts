import type { Image } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Image[], () => {});

  let findIndexById = (id: any, items: any[]) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    add: (values: any) =>
      update((items) => {
        for (const value of values) {
          if (!items.find((item) => value.id === item.id)) items = [...items, value];
        }
        return items;
      }),
    put: (val: Image) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    update: (val: Image[]) => update((items) => val),
    set
  };
}

export default createStore();
