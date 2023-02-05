import { writable } from 'svelte/store';

interface defaults {
  timeout?: number;
  type?: string;
  message?: string;
}

function createStore() {
  const defaults = {
    timeout: 0,
    type: 'success',
    message: ''
  } as defaults;
  const { subscribe, update, set } = writable(defaults, () => {});

  let { timeout } = defaults;
  let timeoutId: ReturnType<typeof setTimeout>;

  return {
    subscribe,
    update: (value: defaults) =>
      update(() => {
        ({ timeout } = { ...defaults, ...value });
        clearTimeout(timeoutId);
        if (timeout) {
          timeoutId = setTimeout((val) => set(val), timeout, { ...defaults });
        }
        return { ...defaults, ...value };
      }),
    text: (message: string) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
