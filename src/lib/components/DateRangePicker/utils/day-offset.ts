import { get } from 'svelte/store';
import localeStore from '../stores/localeStore';

export const dayOffset = (firstDayOfWeek: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(
    firstDayOfWeek.toLocaleLowerCase(get(localeStore).toString())
  ) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
