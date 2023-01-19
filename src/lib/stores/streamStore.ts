import type { IndexedStream } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as IndexedStream[], () => {});

  let findIndexById = (id: string, items: IndexedStream[]) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    add: (newItems: IndexedStream[]) =>
      update((items) => {
        for (const newItem of newItems) {
          if (!items.find((item: IndexedStream) => newItem.id === item.id))
            items = [...items, newItem];
        }
        return items;
      }),
    put: (item: IndexedStream) =>
      update((items) => {
        const index = findIndexById(item.id, items);
        if (index != -1)
          return [
            ...items.slice(0, index),
            { ...items[index], ...item },
            ...items.slice(index + 1)
          ];
        return [...items, item];
      }),
    del: (id: string) => update((items) => items.filter((item: IndexedStream) => item.id !== id)),
    update: (items: IndexedStream[]) => update(() => items),
    set
  };
}

export default createStore();
