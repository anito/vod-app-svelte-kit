import { writable } from 'svelte/store';

function createStore() {
  const { subscribe, update, set } = writable({}, () => {});
  const TIMEOUT = 4000;
  const PERMANENT = false;
  const RESET = {
    message: '',
    type: 'success'
  };
  /** @type {ReturnType<typeof setTimeout>} */
  let timeoutId;

  return {
    subscribe,
    /** @param {Object} value */
    update: (value) =>
      update(() => {
        let { permanent, timeout } = { timeout: TIMEOUT, permanent: PERMANENT, ...value };
        clearTimeout(timeoutId);
        if (!permanent === true) {
          timeoutId = setTimeout((val) => set(val), timeout, { ...RESET });
        }
        return { ...value, permanent };
      }),
    /** @param {string} message */
    text: (message) => update((val) => ({ ...val, message }))
  };
}

export default createStore();
