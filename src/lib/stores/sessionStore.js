// @ts-nocheck
import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';

function createStore() {
  return derived(
    [sessionCookie, page],
    ([$sessionCookie, $page], set) => {
      set({ ...$page.data.session, ...$sessionCookie });
    },
    void {} // initial value
  );
}

export default createStore();
