import { writable } from 'svelte/store';

function createStore() {
  const { update, subscribe, set } = writable({
    primary: '',
    secondary: ''
  });

  return {
    update,
    subscribe,
    set
  };
}

export default createStore();
