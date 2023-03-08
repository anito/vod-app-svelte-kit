import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { session } from '$lib/stores';
import { parseLifetime } from '$lib/utils';

function createStore() {
  const INTERVAL = 1;
  let time;
  let intervalId: string | number | NodeJS.Timer | undefined;

  return derived(
    /**
     * We do need sessionStore here as well (although never used elsewhere in this code),
     * in order to reflect changes made on sessionHelperStore which sessionStore depends on
     * - sessionHelperStore is a store that just holds the _expired value from our cookie-session
     */
    [page, session],
    ([$page], set) => {
      if (!$page.data.session.user) return;
      const _expires = new Date().getTime() + parseLifetime($page.data.config.Session?.lifetime);
      if (isNaN(_expires)) {
        return;
      }

      intervalId = setInterval(() => {
        time = _expires - Date.now();
        set(time > 0 ? time : 0);
      }, INTERVAL * 1000);

      // no more subscribers or when callback runs
      return () => {
        clearInterval(intervalId);
      };
    },
    60 * 1000 // initial value 60s
  );
}

export default createStore();
