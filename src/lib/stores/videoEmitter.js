import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({ method: '', data: {}, show: false });

  return {
    subscribe,
    update,
    dispatch: (/** @type {import('$lib/types').VideoEmitter | any} */ val) => update(() => val),
    set
  };
}

export default createStore();
