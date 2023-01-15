import type { ConsoleSettings, Session, SessionSettings, Setting, SiteSettings } from '$lib/types';
import { DEFAULT_ADMIN_TAB } from '$lib/utils/const';
import { writable } from 'svelte/store';

function createStore() {
  const defaults: Setting = {
    Session: {
      lifetime: 1
    },
    Site: {
      defaultAdminTab: DEFAULT_ADMIN_TAB,
      salutation: 'Hi',
      salutations: [],
      name: 'Loading...',
      description: '',
      logo: ''
    },
    Console: { infoLevel: 0, log: 0 }
  };
  const { subscribe, update, set } = writable(defaults);

  return {
    subscribe,
    update: (val: Setting[]) =>
      update((current: any) => {
        let currentItem: Setting;
        let ret: any = Object.create({});

        for (let item in val) {
          ret[item] = (currentItem = (item in current && current[item]) || {}) && {
            ...currentItem,
            ...val[item]
          };
        }
        return { ...defaults, ...ret };
      }),
    set
  };
}
export default createStore();
