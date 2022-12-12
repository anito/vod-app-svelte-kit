import { writable } from 'svelte/store';

function createStore() {
  /** @type {any} */
  const defaults = {
    Session: {
      lifetime: 1
    },
    Site: { defaultUserTab: 'profile', salutation: 'Hi', salutations: [] },
    Console: { infoLevel: 0, log: 0 }
  };
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    update: (/** @type {Object<any, any>} */ val) =>
      update((current) => {
        let currentItem;
        /** @type {Object<any, any>}} */
        let ret = {};

        for (let item in val) {
          ret[item] = (currentItem = current[item] || {}) && { ...currentItem, ...val[item] };
        }
        return { ...defaults, ...ret };
      }),
    set
  };
}
export default createStore();
