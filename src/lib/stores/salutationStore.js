import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    /**
     *
     * @param {*} val
     * @returns
     */
    update: (val) => update(() => val),
    set
  };
}
export default createStore();
