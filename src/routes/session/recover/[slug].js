// @ts-nocheck
import { locale } from 'svelte-i18n';

export async function get({ locals, params }) {
	const data = locals.session.data;
	const slug = params.slug;
	if (data[slug]) {
		try {
			locale.set(data[slug]);
		} catch (e) {
			console.log(`ERROR RECOVERING ${slug}: %s`, e);
		}
	}

	return {
		status: 200
	};
}
