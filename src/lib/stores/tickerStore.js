import { derived } from 'svelte/store';
import { session } from '$lib/stores';
import { info } from '$lib/utils';

function createStore() {
  /**
   * @type {number}
   */
  const INTERVAL = 1;
  /**
   * @type {number}
   */
  let time;
  /**
   * @type {ReturnType<typeof setInterval>}
   */
  let intervalId;

  return derived(
    [session],
    /**
     *
     * @param {[import('$lib/types').Session]} param0
     * @param {Function} set
     * @returns
     */
    ([$session], set) => {
      const _expires = new Date($session._expires).getTime();
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

        info(
          3,
          '%c PAGE DATA (SESSION) RECEIVED',
          'background: #8bc34a; color: #000000; padding:4px 6px 3px 0;'
        );
      };
    },
    100 * 1000 // initial value
  );
}

export default createStore();
