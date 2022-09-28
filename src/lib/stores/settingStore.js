import { writable } from 'svelte/store';

function createStore() {
  /** @type {import('$lib/types').Setting} */
  const defaults = {
    Session: {
      lifetime: 30 * 24 * 60 * 60 * 1000
    },
    Site: { defaultUserTab: 'profile', salutation: 'Hi' },
    Console: { info: false, log: false }
  };
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    /** @param {import('$lib/types').Setting} val */
    update: (val) =>
      update((current) => {
        let cur;
        /** @type {Object<any, any>}} */
        let ret = {};
        /** @type {string | any} */
        for (let item in val) {
          // @ts-ignore
          ret[item] = (cur = current[item] || {}) && { ...cur, ...val[item] };
        }
        return { ...defaults, ...ret };
      }),
    set
  };
}
export default createStore();
