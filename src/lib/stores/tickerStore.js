import { derived } from 'svelte/store';
import { session, settings } from '$lib/stores';
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
    [session, settings],
    /**
     *
     * @param {[import('$lib/types').Session, import('$lib/types').Setting]} param0
     * @param {Function} set
     * @returns
     */
    ([$session, $settings], set) => {
      const expires = () => {
        return {
          CONFIG: new Date($session._expires).getTime(),
          SESSION: new Date().getTime() + $settings.Session.lifetime * 60 * 1000
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

        info(
          3,
          '%c PAGE DATA RECEIVED ',
          'background: #8bc34a; color: #000000; padding:4px 6px 3px 0;'
        );
      };
    },
    60 * 1000 // initial value
  );
}

export default createStore();
