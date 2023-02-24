import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { session } from '$lib/stores';
import { parseLifetime } from '$lib/utils';

function createStore() {
  const INTERVAL = 1;
  let time;
  let intervalId: string | number | NodeJS.Timeout | undefined;

  return derived(
    [session, page],
    ([$session, $page], set) => {
      if (!$session.user) return;

      const expires = () => {
        return {
          SESSION: new Date($session._expires).getTime(),
          CONFIG: new Date().getTime() + parseLifetime($page.data.config.Session?.lifetime)
        };
      };
      const { CONFIG, SESSION } = expires();

      const _expires = CONFIG;
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

        console.log(
          '%c PAGE DATA RECEIVED ',
          'background: #8bc34a; color: #000000; padding:4px 6px 3px 0;'
        );
      };
    },
    60 * 1000 // initial value
  );
}

export default createStore();
