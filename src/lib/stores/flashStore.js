// @ts-nocheck
import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({}, () => {});
  let timeoutId;

  return {
    subscribe,
    update: (value) =>
      update(() => {
        const { timeout } = { ...value };
        clearTimeout(timeoutId);
        if (!!timeout && !isNaN(timeout)) {
          // reset message after expiration time
          timeoutId = setTimeout((val) => set(val), timeout, {
            message: '',
            type: 'success'
          });
        }
        return value;
      }),
    text: (message) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
