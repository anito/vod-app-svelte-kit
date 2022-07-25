// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([], () => {});

  let findIndex = (id, items) => {
    return items.findIndex((itm) => itm.id == id);
  };
  let sortFunc = (a, b) => {
    return a.src.toLowerCase() < b.src.toLowerCase()
      ? -1
      : a.src.toLowerCase() > b.src.toLowerCase()
      ? 1
      : 0;
  };

  return {
    subscribe,
    add: (val) => update((items) => [...items, ...val].sort(sortFunc)),
    put: (id) =>
      update((items) => {
        const index = findIndex(id, items);
        return [
          ...items.slice(0, index),
          { ...items[index], ...item },
          ...items.slice(index + 1)
        ].sort(sortFunc);
      }),
    del: (id) => update((items) => items.filter((itm) => itm.id !== id)),
    update: (val) => update(() => val.sort(sortFunc)),
    set
  };
}

export default createStore();
