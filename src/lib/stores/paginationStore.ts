import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable({} as any);

  return {
    update: (item: any) =>
      update((items) => {
        return { ...items, [item.name]: item.data };
      }),
    subscribe,
    set
  };
}

export default createStore();
