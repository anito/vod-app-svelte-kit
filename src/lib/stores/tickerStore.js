// @ts-nocheck
import { derived } from 'svelte/store';
import { session } from '$app/stores';
import { __ticker__ } from '$lib/utils';

function createStore() {
  const INTERVAL = 1;
  let exp;

  return derived(
    session,
    ($s, set) => {
      exp = $s._expires;
      if (!exp) return;
      if (!(exp instanceof Date)) {
        exp = new Date(exp);
      }

      __ticker__.interval = setInterval(() => {
        let time = exp - new Date();
        set(time > 0 ? time : 0);
      }, INTERVAL * 1000);

      // no more subscribers or when callback runs
      return () => {
        clearInterval(__ticker__.interval);

        // console.log(
        // 	'%c TICKER EXTEND OR END',
        // 	'background: #ff5722; color: #000000; padding:4px 6px 3px 0;'
        // );
      };
    },
    void 0 // initial value
  );
}

export default createStore();
