import { writable } from 'svelte/store';

interface Defaults {
  timeout?: number;
  type?: string;
  message?: string;
}

function createStore() {
  const defaults = {
    timeout: 0,
    type: 'success',
    message: ''
  } as Defaults;
  const { subscribe, update, set } = writable(defaults, () => {});

  let { timeout } = defaults;
  let timeoutId: ReturnType<typeof setTimeout>;

  return {
    subscribe,
    update: (value: Defaults) =>
      update(() => {
        ({ timeout } = { ...defaults, ...value });
        clearTimeout(timeoutId);
        if (timeout) {
          timeoutId = setTimeout((val: Defaults) => set(val), timeout, { ...defaults });
        }
        return { ...defaults, ...value };
      }),
    text: (message: string) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
