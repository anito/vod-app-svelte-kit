import type { MailTemplate } from '$lib/types';
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable([] as MailTemplate[]);

  let findIndexById = (id: string, items: MailTemplate[]) => {
    return items.findIndex((itm: any) => itm.id == id);
  };

  return {
    subscribe,
    update: (val: MailTemplate[]) => update((_) => val),
    add: (val: MailTemplate) =>
      update((items) => (findIndexById(val.id, items) == -1 && [...items, val]) || items),
    put: (val: MailTemplate) =>
      update((items) => {
        const index = findIndexById(val.id, items);
        return [...items.slice(0, index), { ...items[index], ...val }, ...items.slice(index + 1)];
      }),
    del: (id: string) => update((items) => items.filter((item: { id: string }) => item.id !== id)),
    set
  };
}
export default createStore();
