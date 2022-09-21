import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { session, settings } from '$lib/stores';

function createStore() {
  /**
   * @type {number}
   */
  const INTERVAL = 1;
  /**
   * @type {number}
   */
  /**
   * @type {any}
   */
  let expires;
  /**
   * @type {number}
   */
  let time;
  /**
   * @type {ReturnType<typeof setInterval>}
   */
  let intervalId;

  return derived(
    [settings, session, page],
    /**
     *
     * @param {*} param0
     * @param {*} set
     * @returns
     */
    ([$settings, $session, $page], set) => {
      const startCustomSession = new Date($session.start).getTime();
      const startPageSession = new Date($page.data.session.start).getTime();
      const start = [startCustomSession, startPageSession].sort((a, b) => a - b)[1];
      const lifetime = parseInt($settings.Session.lifetime);
      expires = start + lifetime;
      if (isNaN(expires)) {
        return;
      }
      if (!(expires instanceof Date)) {
        expires = new Date(expires);
      }

      intervalId = setInterval(() => {
        time = expires - new Date().getTime();
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
