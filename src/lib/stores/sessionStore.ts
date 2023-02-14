import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionCookie } from '$lib/stores';
import type { Group, User } from '$lib/types';

let user: User;
let groups: Group[] = [];

function createStore() {
  return derived(
    [page, sessionCookie],
    ([$page, $sessionCookie], set) => {
      const session = { ...$page.data.session, ...$sessionCookie };
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
