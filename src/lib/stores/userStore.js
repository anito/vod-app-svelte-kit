import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable(/** @type {import('$lib/types').User[]} */ [], () => {
    // first subscriber
  });

  /**
   * @param {string} id
   * @param {import('$lib/types').User[]} items
   */
  let findIndexById = (id, items) => {
    return items.findIndex(/** @param {import('$lib/types').User} itm */ (itm) => itm.id == id);
  };

  return {
    subscribe,
    /**
     * @param {import('$lib/types').User[]} values
     */
    add: (values) =>
      update(
        /**
         * @param {import('$lib/types').User[]} items
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
     * @param {import('$lib/types').User} val
     */
    put: (val) =>
      update(
        /**
         * @param {import('$lib/types').User[]} items
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

    update: (/** @type {never[]} */ val) => update(() => val),
    set
  };
}

export default createStore();
