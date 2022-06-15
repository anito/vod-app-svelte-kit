// @ts-nocheck
import * as api from '$lib/api';
import { dev } from '$app/env';
import { serialize } from 'cookie';

export async function post({ locals, request }) {
	const data = await locals.session.data();
	const locale = await request.json();

	return await api.get(`settings/locale?locale=${locale}`).then(async (res) => {
		if (res?.success) {
			const { locale } = { ...res.data };
			return await locals.session
				.data({
					...data,
					locale
				})
				.then((resSession) => {
					return {
						headers: {
							'Set-Cookie': serialize('locale', locale, {
								path: '/',
								httpOnly: false,
								sameSite: 'none',
								secure: true,
								maxAge: 60 * 60 * 24 * 7 // one week,
							})
						},
						body: { ...res }
					};
				});
		}
		return {
			status: 302
		};
	});
}
