import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([], () => {});

  /**
   *
   * @param {string} id
   * @param {import('../types').Image[]} items
   * @returns {number}
   */
  let findIndexById = (id, items) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    /**
     *
     * @param {import('../types').Image[]} values
     * @returns
     */
    add: (values) =>
      update(
        /**
         * @param {any} items
         * @return {never | any}
         */
        (items) => {
          for (const value of values) {
            if (!items.find((/** @type {{ id: string; }} */ item) => value.id === item.id))
              items = [...items, value];
          }
          return items;
        }
      ),
    /**
     * @param {import('../types').Image} val
     */
    put: (val) =>
      update(
        /**
         * @param {any} items
         * @return {never | any}
         */
        (items) => {
          const index = findIndexById(val.id, items);
          return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
        }
      ),
    /**
     * @param {string} id
     */
    del: (id) =>
      update((items) =>
        items.filter(/** @param {import('../types').Image} itm */ (itm) => itm.id !== id)
      ),
    update: (/** @type {any} */ val) => update((items) => val),
    set
  };
}

export default createStore();
