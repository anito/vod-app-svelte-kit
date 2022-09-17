import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';

function createStore() {
  return derived(
    [page, sessionCookie],
    ([$page, $sessionCookie], set) => {
      // const session = { ...$page.data.session };
      const session = { ...$page.data.session, ...$sessionCookie };
      // const session = { ...$sessionCookie };
      set(session);
    },
    {} // initial value
  );
}

export default createStore();
