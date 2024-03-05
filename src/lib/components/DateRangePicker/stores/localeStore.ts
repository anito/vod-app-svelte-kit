import { writable } from 'svelte/store';
import en from 'date-fns/locale/en-US/index.js';

function createStore() {
  const { subscribe, update, set } = writable(en, () => {});

  return {
    subscribe,
    update: (val: any) => update(() => val),
    set
  };
}

export default createStore();
