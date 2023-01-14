import { randomItem } from '$lib/utils';
import { derived } from 'svelte/store';
import { settings } from '.';

function createStore() {
  return derived(
    [settings],
    ([$settings], set) => {
      if ($settings.Site?.salutations?.length) {
        set(randomItem($settings.Site?.salutations));
      }
    },
    'Hi'
  );
}
export default createStore();
