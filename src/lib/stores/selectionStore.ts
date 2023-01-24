import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable([] as string[]);

  return {
    add: (id: string) => update((items) => [...items, id]),
    remove: (id: string) => update((items) => items.filter((item) => item !== id)),
    reset: () => update(() => []),
    subscribe,
    set
  };
}

export default createStore();
