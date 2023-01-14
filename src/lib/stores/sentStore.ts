import type { Sent } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Sent[]);

  let findIndexById = (id: string, items: Sent[]) => {
    return items.findIndex((itm: { id: string }) => itm.id == id);
  };

  return {
    subscribe,
    update: (val: Sent<Record<string, any>>[]) => update(() => val),
    put: (val: Sent<Record<string, any>>) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    set
  };
}
export default createStore();
