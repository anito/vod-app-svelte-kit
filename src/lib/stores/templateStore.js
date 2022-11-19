import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

  /**
   *
   * @param {string} id
   * @param {any[]} items
   * @returns {number}
   */
  let findIndexById = (id, items) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    update: (/** @type {never[]} */ val) => update((_) => val),
    add: (/** @type {{ id: string; items: any[] }} */ val) =>
      update(
        /** @param {any | never[]} items */ (items) =>
          (findIndexById(val.id, items) == -1 && [...items, val]) || items
      ),
    put: (/** @type {{ id: string; items: any[] }} */ val) =>
      update(
        /** @param {any | never[]} items */ (items) => {
          const index = findIndexById(val.id, items);
          return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
        }
      ),
    del: (/** @type {string} */ id) =>
      update(
        /** @param {any | never[]} items */ (items) =>
          items.filter((/** @type {{ id: string; }} */ item) => item.id !== id)
      ),
    set
  };
}
export default createStore();
