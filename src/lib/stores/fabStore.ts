import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable();

  let previousFab: unknown;

  return {
    subscribe,
    update: (val: any) =>
      update((_) => {
        return (previousFab = _), val;
      }),
    restore: () => update((_) => previousFab),
    set
  };
}
export default createStore();
