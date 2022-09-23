import { derived } from 'svelte/store';
import { session, settings } from '$lib/stores';

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
     * @param {*} param0
     * @param {*} set
     * @returns
     */
    ([$session], set) => {
      const expires = new Date($session.end).getTime();
      if (isNaN(expires)) {
        return;
      }

      intervalId = setInterval(() => {
        time = expires - Date.now();
        set(time > 0 ? time : 0);
      }, INTERVAL * 1000);

      // no more subscribers or when callback runs
      return () => {
        clearInterval(intervalId);

        // console.log(
        //   `%c TICKER ${time ? 'EXTEND' : 'END'}`,
        //   `background: ${time ? '#8bc44a' : '#ff5722'}; color: #000000; padding:4px 6px 3px 0;`
        // );
      };
    },
    1000 // initial value
  );
}

export default createStore();
