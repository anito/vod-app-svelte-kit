// @ts-nocheck
import * as api from '$lib/api';
import { settings } from '$lib/stores';

export async function serverConfig() {
	return new Promise(async (resolve, reject) => {
		const res = await api.get(`settings`);
		if (res?.success) {
			settings.update({ ...res.data });
		}
		resolve(res);
	});
}
