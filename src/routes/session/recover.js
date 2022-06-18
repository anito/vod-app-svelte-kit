// @ts-nocheck
import { locale } from 'svelte-i18n';

export async function get({ locals }) {
	const data = locals.session.data;
	if (data.locale) {
		try {
			locale.set(data.locale);
		} catch (e) {
			console.log('i18n-svelte ERROR: %s', e);
		}
	}

	return {
		status: 200
	};
}
