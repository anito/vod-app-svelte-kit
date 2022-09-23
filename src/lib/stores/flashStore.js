import { writable } from 'svelte/store';

function createStore() {
  const defaults = {
    timeout: 4000,
    permanent: false,
    type: 'success',
    message: ''
  };
  const { subscribe, update, set } = writable(defaults, () => {});

  let { permanent, timeout } = defaults;
  /** @type {ReturnType <typeof setTimeout>} */
  let timeoutId;
  /** @type {ReturnType<typeof setTimeout>} */

  return {
    subscribe,
    update: (/** @type {any} */ value) =>
      update(() => {
        // @ts-ignore
        ({ permanent, timeout } = { ...defaults, ...value });
        clearTimeout(timeoutId);
        if (!permanent === true) {
          timeoutId = setTimeout((val) => set(val), timeout, { ...defaults });
        }
        return { ...value, permanent };
      }),
    /** @param {string} message */
    text: (message) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
