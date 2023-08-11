import { derived } from 'svelte/store';
import { users } from '$lib/stores';
import { isExpired, SUPERUSER } from '$lib/utils';
import type { Issue } from '$lib/types';
import type { User } from '$lib/classes/repos/types';

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
  const defs: { key: Issue; test: (value: User) => boolean }[] = [
    {
      key: {
        id: 'account-inaccessible',
        eventType: '',
        dialogType: 'resolve-all',
        label: 'text.content-inaccessible',
        reason: '',
        flag: 'warning',
        type: ''
      },
      test: (user: User) =>
        hasActiveVideos(user) &&
        (!user.jwt || !user.active || (user.expires && isExpired(user.expires)))
    },
    {
      key: {
        id: 'user-inactive',
        eventType: 'user-activate',
        dialogType: 'user-activate',
        label: 'text.activate-user',
        reason: 'text.user-is-deactivated',
        flag: 'flash',
        type: 'issue'
      },
      test: (user: User) => !user.active
    },
    {
      key: {
        id: 'token-expired',
        eventType: 'token-generate',
        dialogType: 'token-generate',
        label: 'text.regenerate-expired-token',
        reason: 'text.token-expired',
        flag: 'flash',
        type: 'issue'
      },
      test: (user: User) => user.expires && isExpired(user.expires)
    },
    {
      key: {
        id: 'token-missing',
        eventType: 'token-generate',
        dialogType: 'token-generate',
        label: 'text.generate-token',
        reason: 'no-token-information',
        flag: 'flash',
        type: 'issue'
      },
      test: (user: User) => !user.jwt && user.role !== SUPERUSER
    }
  ];

  return derived(users, ($users, set: (value: Map<string | null, { issues: Issue[] }>) => void) => {
    if (!$users) return;

    for (let user of $users) {
      let issues: Issue[] = [];
      for (const def of defs) {
        def.test(user) && issues.push(def.key);
      }
      infos.set(user.id, {
        issues
      });
    }
    set(infos);
  });
}

export default createStore();
