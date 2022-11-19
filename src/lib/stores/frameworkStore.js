import { writable } from 'svelte/store';

function createStore() {
  /**
   * @type {import('$lib/types').Framework}
   */
  const defaults = [];
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    update: (val) => update((_) => val),
    set
  };
}
export default createStore();
