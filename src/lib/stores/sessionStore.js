import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';

/** @type {import('$lib/types').User} */
let user;
/** @type {import('$lib/types').Group[]} */
let groups = [];

function createStore() {
  return derived(
    [page, sessionCookie],
    ([$page, $sessionCookie], set) => {
      const session = { ...$page.data.session };
      set(session);
    },
    {
      data: {
        code: 200,
        message: ''
      },
      user,
      role: '',
      groups,
      _expires: new Date().toISOString(),
      message: '',
      code: 200,
      fromToken: false,
      success: false,
      renewed: false,
      locale: ''
    } // initial value
  );
}

export default createStore();
