import { page } from '$app/stores';
import { derived } from 'svelte/store';

function createStore() {
  return derived([page], ([$page], set) => {
    set($page.data.config);
  });
}
export default createStore();
