import { writable } from 'svelte/store';
import type { Mail } from '$lib/types';

function createStore() {
  const { subscribe, update, set } = writable([] as Mail[]);

  let findIndexById = (id: string, items: Mail[]) => {
    return items.findIndex((itm: { id: string }) => itm.id == id);
  };

  return {
    subscribe,
    update: (val: Mail<Record<string, any>>[]) => update(() => val),
    put: (val: Mail<Record<string, any>>) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    set
  };
}
export default createStore();
