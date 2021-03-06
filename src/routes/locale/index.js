// @ts-nocheck
import * as api from '$lib/api';
import { serialize } from 'cookie';

export async function post({ locals, request }) {
	const locale = await request.json();

	return await api.get(`settings/locale?locale=${locale}`, { fetch }).then(async (res) => {
		if (res.success) {
			await locals.session.set({
				...locals.session.data,
				locale
			});
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
		}
		return {
			status: 302
		};
	});
}
