import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { Group, Session } from '$lib/types';
import type { User } from '$lib/classes/repos/types';

let user: User;
let groups: Group[] = [];

function createStore() {
  return derived(
    [page],
    ([$page], set: (value: Session) => void) => {
      const session: Session = { ...$page.data.session };
      set(session);
    },
    {} // initial value
  );
}

export default createStore();
