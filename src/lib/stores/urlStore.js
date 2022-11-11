import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable(new Map(), () => {});

  /**
   *
   * @param {Map<string, any>} items
   * @param {any} item
   * @returns
   */
  const param = (items, item) => {
    const value = (items.has(item.id) && items.get(item.id)) || { [item.params]: item.url };
    !value[item.params] && (value[item.params] = item.url);
    items.set(item.id, value);
    return items;
  };
  return {
    subscribe,
    /**
     *
     * @param {any} item
     * @returns
     */
    add: (item) => update((items) => param(items, item)),
    /**
     *
     * @param {string} id
     * @returns
     */
    del: (id) => update((items) => (items.delete(id) && items) || items),
    /**
     *
     * @param {any} item
     * @returns
     */
    put: (item) =>
      update((items) => (items.has(item.id) && items.set(item.id, item) && items) || items),
    set
  };
}

export default createStore();
