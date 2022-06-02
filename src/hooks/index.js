// @ts-nocheck

import { handleSession } from 'svelte-kit-cookie-session';

export const handle = handleSession(
	{
		secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
	},
	({ event, resolve }) => {
		const response = resolve(event);

		// console.log('HANDLE::locals', event.locals);

		return response;
	}
);

export const getSession = async ({ locals }) => {
	return (await locals.session.data()) || {};
};

export async function handleError({ error, event }) {
	console.log('ERROR (hooks.js)', error, event);
}
