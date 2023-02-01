import type { Image } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as Image[], () => {});

  let findIndexById = (id: any, items: any[]) => {
    return items.findIndex((itm) => itm.id == id);
  };

  return {
    subscribe,
    add: (images: any) =>
      update((items) => {
        for (const image of images) {
          if (!items.find((item) => image.id === item.id)) items = [...items, image];
        }
        return items;
      }),
    put: (image: Image) =>
      update((items) => {
        const index = findIndexById(image.id, items);
        return [...items.slice(0, index), { ...items[index], ...image }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((itm) => itm.id !== id)),
    update: (images: Image[]) => update(() => images),
    set
  };
}

export default createStore();
