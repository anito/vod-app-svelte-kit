import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';

/** @type {import('$lib/types').User} */
let user;

function createStore() {
  return derived(
    [page, sessionCookie],
    ([$page, $sessionCookie], set) => {
      const session = { ...$page.data.session };
      set(session);
    },
    {
      user,
      role: '',
      _expires: new Date().toISOString(),
      message: '',
      code: 200,
      success: false,
      renewed: false
    } // initial value
  );
}

export default createStore();
