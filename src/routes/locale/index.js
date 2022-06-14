// @ts-nocheck
import * as api from '$lib/api';
import { serialize } from 'cookie';

export async function post({ locals, request }) {
	const data = await locals.session.data();
	const locale = await request.json();

	return await api.get(`settings/locale?locale=${locale}`).then(async (res) => {
		if (res?.success) {
			const { locale, message } = { ...res.data };
			return await locals.session
				.data({
					...data,
					locale
				})
				.then((res) => {
					return {
						headers: {
							'Set-Cookie': serialize('locale', locale, {
								path: '/',
								httpOnly: true,
								sameSite: 'Lax',
								secure: false,
								maxAge: 60 * 60 * 24 * 7 // one week
							})
						},
						body: { data: { ...res }, locale, message }
					};
				});
		}
		return {
			status: 302
		};
	});
}
