// @ts-nocheck
import { derived } from 'svelte/store';
import { users } from '$lib/stores';
import { isExpired, SUPERUSER } from '$lib/utils';

function createStore() {
  /**
   *
   * @param {import('$lib/types').User} usr
   * @returns boolean
   */
  function hasActiveVideos(usr) {
    let end,
      active,
      now = new Date();
    return usr.videos?.reduce((cum, cur) => {
      active = (end = cur._joinData.end) && new Date(end) > now;
      return cum || active;
    }, false);
  }
  const infos = new Map();
  const DEFS = [
    {
      key: {
        id: 'account-inaccessible',
        eventType: 'INFO:open:ResolveAllDialog',
        label: 'text.content-inaccessible',
        reason: '',
        flag: 'warning',
        type: ''
      },
      /**
       *
       * @param {import('$lib/types').User} usr
       */
      value: (usr) =>
        hasActiveVideos(usr) && (!usr.jwt || !usr.active || (usr.expires && isExpired(usr.expires)))
    },
    {
      key: {
        id: 'token-expired',
        eventType: 'INFO:token:Generate',
        label: 'text.regenerate-expired-token',
        reason: 'text.token-expired',
        flag: 'flash',
        type: 'issue'
      },
      /**
       *
       * @param {import('$lib/types').User} usr
       */
      value: (usr) => usr.expires && isExpired(usr.expires)
    },
    {
      key: {
        id: 'user-inactive',
        eventType: 'INFO:user:Activate',
        label: 'text.activate-user',
        reason: 'text.user-is-deactivated',
        flag: 'flash',
        type: 'issue'
      },
      /**
       *
       * @param {import('$lib/types').User} usr
       */
      value: (usr) => !usr.active
    },
    {
      key: {
        id: 'token-missing',
        eventType: 'INFO:token:Generate',
        label: 'text.generate-token',
        flag: 'flash',
        type: 'issue'
      },
      /**
       *
       * @param {import('$lib/types').User} usr
       */
      value: (usr) => !usr.jwt && usr.role !== SUPERUSER
    }
  ];

  return derived(users, ($users, set) => {
    if (!$users) return;

    for (let user of $users) {
      let res = [];
      for (const def of DEFS) {
        def.value(user) && res.push(def.key);
      }
      let item = infos.get(user.id);
      (item && ((res.length && (item.params = [...res])) || infos.delete(user.id))) ||
        (res.length &&
          infos.set(user.id, {
            params: res
          }));
    }
    set(infos);
  });
}

export default createStore();
