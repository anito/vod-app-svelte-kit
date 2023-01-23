import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable([] as string[]);

  return {
    add: (id: string) =>
      update((items) => {
        const index = items.findIndex((item) => item === id);
        return [...items.slice(0, index), id, ...items.slice(index + 1)];
      }),
    remove: (id: string) => update((items) => items.filter((item) => item !== id)),
    reset: () => update(() => []),
    subscribe,
    set
  };
}

export default createStore();
