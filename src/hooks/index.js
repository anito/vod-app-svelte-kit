// @ts-nocheck

import { dev } from '$app/env';
import { handleSession } from 'svelte-kit-cookie-session';

export const handle = handleSession(
	{
		secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
	},
	({ event, resolve }) => {
		dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0);

		const response = resolve(event);

		// console.log('HANDLE::locals', event.locals);

		return response;
	}
);

export const getSession = async ({ locals }) => {
	return locals.session.data;
};

export async function handleError({ error, event }) {
	console.log('ERROR (hooks.js)', error, event);
}
