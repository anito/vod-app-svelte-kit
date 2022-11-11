// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

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
    update: (/** @type {never[]} */ val) => update((_) => val),
    add: (/** @type {{ id: string; }} */ val) =>
      update((items) => {
        return (findIndexById(val.id, items) == -1 && [...items, val]) || items;
      }),
    /**
     *
     * @param {*} val
     * @returns
     */
    put: (val) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (/** @type {any} */ id) => update((items) => items.filter((item) => item.id !== id)),
    set
  };
}
export default createStore();
