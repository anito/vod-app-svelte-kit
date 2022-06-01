// @ts-nocheck
import { derived } from 'svelte/store';
import { default as settings } from './settingStore';

export default derived(settings, ($s, set) => set($s.Site?.name || '...'));
