import * as api from '$lib/api';
import { settings } from '$lib/stores';

export const INIT_OPTIONS = {
	Session: {
		lifetime: 4 * 60 * 60 * 1000
	}
};

export async function serverConfig() {
	settings.set({ ...INIT_OPTIONS });
	const res = await api.get('settings');
	if (res?.success) {
		settings.update({ ...INIT_OPTIONS, ...res.data });
	}
}
