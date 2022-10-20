import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([], () => {
    // first subscriber
  });

  /**
   * @param {string} id
   * @param {import('$lib/types').User[] | any} items
   */
  let findIndexById = (id, items) => {
    return items.findIndex(/** @param {import('$lib/types').User} itm */ (itm) => itm.id == id);
  };

  return {
    subscribe,
    /**
     * @param {import('$lib/types').User} val
     */
    add: (val) =>
      update(
        /**
         * @param {any} items
         * @return {never | any}
         */
        (items) => {
          return (findIndexById(val.id, items) == -1 && [...items, val]) || items;
        }
      ),
    /**
     * @param {import('$lib/types').User} val
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
    /** @param {string | null} id */
    del: (id) =>
      update((items) =>
        items.filter(
          /**
           * @param {import('$lib/types').User} itm
           */
          (itm) => itm.id !== id
        )
      ),
    /**
     * @param {any} val
     * @return {never | any}
     */
    update: (val) => update((items) => val),
    set
  };
}

export default createStore();
