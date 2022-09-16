import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

  /**
   * @param {string} id
   * @param {import('$lib/types').Sent[]} items
   */
  let findIndexById = (id, items) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    /** @param {never[]} val */
    update: (val) => update(() => val),
    /** @param {import('$lib/types').Sent} val */
    put: (val) =>
      // @ts-ignore
      update((items) => {
        const index = findIndexById(val.id, items);
        // @ts-ignore
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    // @ts-ignore
    del: (id) => update((items) => items.filter((itm) => itm.id !== id)),
    set
  };
}
export default createStore();
