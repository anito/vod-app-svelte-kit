import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable(new Map(), () => {});

  const param = (items: Map<any, any>, item: { id: any; params: string | number; url: any }) => {
    const value = (items.has(item.id) && items.get(item.id)) || { [item.params]: item.url };
    !value[item.params] && (value[item.params] = item.url);
    items.set(item.id, value);
    return items;
  };
  return {
    subscribe,
    add: (item: any) => update((items) => param(items, item)),
    del: (id: string) => update((items) => (items.delete(id) && items) || items),
    put: (item: { id: any }) =>
      update((items) => (items.has(item.id) && items.set(item.id, item) && items) || items),
    set
  };
}

export default createStore();
