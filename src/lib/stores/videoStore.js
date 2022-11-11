// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([], () => {});

  /**
   *
   * @param {string} id
   * @param {import('svelte/store').Updater<never>[]} items
   * @returns {number}
   */
  let findIndexById = (id, items) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    /**
     *
     * @param {import('../types').Video} val
     * @returns
     */
    add: (val) =>
      update(
        /** @param {import('svelte/store').Updater<never[]>} items */ (items) => [...items, ...val]
      ),
    /**
     * @param {import('../types').Video} val
     */
    put: (val) =>
      update(
        /** @param {import('svelte/store').Updater<never>[]} items */ (items) => {
          const index = findIndexById(val.id, items);
          return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
        }
      ),
    /**
     * @param {string} id
     */
    del: (id) =>
      update((items) =>
        items.filter(/** @param {import('../types').Video} itm */ (itm) => itm.id !== id)
      ),
    update: (/** @type {never[]} */ val) => update((items) => val),
    set
  };
}

export default createStore();
