import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([], () => {});

  return {
    subscribe,
    /**
     *
     * @param {import('../types').Video[]} values
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
     *
     * @param {any} val
     * @returns
     */
    update: (val) => update(() => val),
    set
  };
}

export default createStore();
