// @ts-nocheck
import { randomItem } from '$lib/utils';
import { derived } from 'svelte/store';
import { session, settings } from '.';

let user;
export default derived(
  [settings, session],
  ([$settings, $session], set) => {
    if ($session.user && $session.user !== user) {
      user = $session.user;
      const salutation = randomItem($settings.Site.salutations);
      set(salutation);
    }
  },
  'Hi'
);
