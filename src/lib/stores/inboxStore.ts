import type { Mail } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Mail[]);

  let findIndexById = (id: string, items: Mail[]) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    update: (val: Mail[]) => update((_) => val),
    put: (val: Mail) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    set
  };
}
export default createStore();
