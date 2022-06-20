// @ts-nocheck

import { dev } from '$app/env';
import { handleSession } from 'svelte-kit-cookie-session';
import { getAuxSession } from '$lib/utils';

export const handle = handleSession(
	{
		secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
	},
	async ({ event, resolve }) => {
		dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0);

		// console.log('HANDLE::locals', event);

		return await resolve(event);
	}
);

export const getSession = getAuxSession();

// original implementaion deactivated
export const _getSession = ({ locals }) => {
	return locals.session.data;
};

export async function handleError({ error, event }) {
	console.log('ERROR (hooks.js)', error, event);
}
