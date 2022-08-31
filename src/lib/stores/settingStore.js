// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const defaults = {
    Session: {
      lifetime: 60 * 1000
    }
  };
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    update: (val) =>
      update((current) => {
        let cur,
          ret = {};
        for (let item in val) {
          ret[item] = (cur = current[item] || {}) && { ...cur, ...val[item] };
        }
        return ret;
      }),
    set
  };
}
export default createStore();
