import type { User } from '$lib/classes/repos/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as User[], () => {
    // first subscriber
  });

  let findIndexById = (id: any, items: User[]) => {
    return items.findIndex((itm: { id: any }) => itm.id == id);
  };

  return {
    subscribe,
    add: (values: User[]) =>
      update((items) => {
        for (const value of values) {
          if (!items.find((item) => value.id === item.id)) items = [...items, value];
        }
        return items;
      }),
    put: (val: any) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: any) => update((items) => items.filter((itm) => itm.id !== id)),

    update: (val: User[]) => update(() => val),
    set
  };
}

export default createStore();
