import { writable } from 'svelte/store';
import de from 'date-fns/locale/de/index.js';

function createStore() {
  const { subscribe, update, set } = writable(de, () => {});

  return {
    subscribe,
    update: (val: any) => update(() => val),
    set
  };
}

export default createStore();
