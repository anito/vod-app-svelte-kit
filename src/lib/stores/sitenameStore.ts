import { derived } from 'svelte/store';
import { default as settings } from './settingStore';

export default derived(settings, ($settings, set) => set($settings.Site?.name || '...'));
