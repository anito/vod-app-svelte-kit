import { writable } from "svelte/store";

function createStore() {
  const type = "success";
  const status = "";
  const message = "";
  const timeout = 1000;
  const { subscribe, update, set } = writable({}, () => {});
  let timeoutId;

  return {
    subscribe,
    update: (item) =>
      update((_) => {
        clearTimeout(timeoutId);
        // setting and removing the message triggers view respectively
        item.wait !== -1 &&
          (timeoutId = setTimeout((msg) => set(msg), item.timeout || timeout, {
            message,
          }));
        return { type, status, message, ...item };
      }),
    set,
  };
}

export const flash = createStore();
