import type { Avatar } from '$lib/classes/repos/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Avatar[], () => {});

  let findIndex = (id: any, items: any[]) => {
    return items.findIndex((itm: { id: any }) => itm.id == id);
  };

  return {
    subscribe,
    add: (val: Avatar) =>
      update((items) => {
        return (findIndex(val.id, items) == -1 && [...items, val]) || items;
      }),
    put: (id: any) =>
      update((items) => {
        const index = findIndex(id, items);
        return [...items.slice(0, index), { ...items[index], ...items }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    update: (val: never[]) => update(() => val),
    set
  };
}

export default createStore();
