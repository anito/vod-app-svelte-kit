// @ts-nocheck
import { derived } from 'svelte/store';
import { session, settings } from '$lib/stores';
import { __ticker__ } from '$lib/utils';

function createStore() {
  const INTERVAL = 1;
  let expires;
  let time;

  return derived(
    [settings, session],
    ([$settings, $session], set) => {
      const start = new Date($session.start).getTime();
      const lifetime = parseInt($settings.Session.lifetime);
      expires = start + lifetime;
      if (isNaN(expires)) {
        return;
      }
      if (!(expires instanceof Date)) {
        expires = new Date(expires);
      }

      __ticker__.interval = setInterval(() => {
        time = expires - new Date();
        set(time > 0 ? time : 0);
      }, INTERVAL * 1000);

      // no more subscribers or when callback runs
      return () => {
        clearInterval(__ticker__.interval);

        // console.log(
        //   `%c TICKER ${time ? 'EXTEND' : 'END'}`,
        //   `background: ${time ? '#8bc44a' : '#ff5722'}; color: #000000; padding:4px 6px 3px 0;`
        // );
      };
    },
    void 0 // initial value
  );
}

export default createStore();
