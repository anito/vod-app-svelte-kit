import { derived } from 'svelte/store';
import { users } from '$lib/stores';
import { isExpired, SUPERUSER } from '$lib/utils';
import type { Issue, User } from '$lib/types';

function createStore() {
  function hasActiveVideos(user: User) {
    let end,
      active,
      now = new Date();
    return user.videos?.reduce((cum: any, cur: { _joinData: { end: any } }) => {
      active = (end = cur._joinData.end) && new Date(end) > now;
      return cum || active;
    }, false);
  }
  const infos = new Map();
  const defs: any = [
    {
      key: {
        id: 'account-inaccessible',
        eventType: 'info:open:resolve-all-dialog',
        label: 'text.content-inaccessible',
        reason: '',
        flag: 'warning',
        type: ''
      },
      inform: (user: User) =>
        hasActiveVideos(user) &&
        (!user.jwt || !user.active || (user.expires && isExpired(user.expires)))
    },
    {
      key: {
        id: 'token-expired',
        eventType: 'info:token:generate',
        label: 'text.regenerate-expired-token',
        reason: 'text.token-expired',
        flag: 'flash',
        type: 'issue'
      },
      inform: (user: User) => user.expires && isExpired(user.expires)
    },
    {
      key: {
        id: 'user-inactive',
        eventType: 'info:user:activate',
        label: 'text.activate-user',
        reason: 'text.user-is-deactivated',
        flag: 'flash',
        type: 'issue'
      },
      inform: (user: User) => !user.active
    },
    {
      key: {
        id: 'token-missing',
        eventType: 'info:token:generate',
        label: 'text.generate-token',
        flag: 'flash',
        type: 'issue'
      },
      inform: (user: User) => !user.jwt && user.role !== SUPERUSER
    }
  ];

  return derived(users, ($users, set) => {
    if (!$users) return;

    for (let user of $users) {
      let issues: Issue[] = [];
      for (const def of defs) {
        def.inform(user) && issues.push(def.key);
      }
      infos.set(user.id, {
        issues
      });
    }
    set(infos);
  });
}

export default createStore();
