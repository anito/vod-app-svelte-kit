// @ts-nocheck
import * as api from '$lib/api';
import { settings } from '$lib/stores';

export async function serverConfig() {
	await api.get(`settings`).then((res) => {
		if (res?.success) {
			settings.update({ ...res.data });
		}
	});
}
