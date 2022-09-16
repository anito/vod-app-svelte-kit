// @ts-nocheck
import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';

function createStore() {
  return derived(
    [page, sessionCookie],
    ([$page, $sessionCookie], set) => {
      const session = { ...$page.data.session };
      // const session = { ...$sessionCookie, ...$page.data.session };
      set(session);
    },
    void {} // initial value
  );
}

export default createStore();
