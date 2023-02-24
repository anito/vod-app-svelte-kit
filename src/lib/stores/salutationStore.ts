import { page } from '$app/stores';
import { randomItem } from '$lib/utils';
import { derived } from 'svelte/store';

function createStore() {
  return derived(
    [page],
    ([$page], set) => {
      if ($page.data.config.Site?.salutations?.length) {
        set(randomItem($page.data.config.Site?.salutations));
      }
    },
    'Hi'
  );
}
export default createStore();
