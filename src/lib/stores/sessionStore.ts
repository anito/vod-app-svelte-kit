import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { sessionHelper } from '$lib/stores';
import type { Group } from '$lib/types';
import type { User } from '$lib/classes/repos/types';

let user: User;
let groups: Group[] = [];

function createStore() {
  return derived(
    [page, sessionHelper],
    ([$page, $sessionHelper], set) => {
      const session = { ...$page.data.session, ...$sessionHelper };
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
      locale: '',
      salutation: 'Hi'
    } // initial value
  );
}

export default createStore();
