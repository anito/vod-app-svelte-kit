import { writable } from 'svelte/store';

interface defaults {
  timeout?: number;
  permanent?: boolean;
  type?: string;
  message?: string;
}

function createStore() {
  const defaults = {
    timeout: 4000,
    permanent: false,
    type: 'success',
    message: ''
  } as defaults;
  const { subscribe, update, set } = writable(defaults, () => {});

  let { permanent, timeout } = defaults;
  let timeoutId: ReturnType<typeof setTimeout>;

  return {
    subscribe,
    update: (value: defaults) =>
      update(() => {
        ({ permanent, timeout } = { ...defaults, ...value });
        clearTimeout(timeoutId);
        if (!permanent === true) {
          timeoutId = setTimeout((val) => set(val), timeout, { ...defaults });
        }
        return { ...defaults, ...value, permanent };
      }),
    text: (message: string) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
