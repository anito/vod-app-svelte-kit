import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

  let findIndexById = (id: any, items: unknown) => {
    return items.findIndex((itm: any) => itm.id == id);
  };

  return {
    subscribe,
    update: (val: unknown) => update((_) => val),
    add: (val: { id: any }) =>
      update(
        (items) => (findIndexById(val.id, items) == -1 && [...(items as never[]), val]) || items
      ),
    put: (val: { id: any }) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: any) => update((items) => items.filter((item: { id: string }) => item.id !== id)),
    set
  };
}
export default createStore();
