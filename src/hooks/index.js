// @ts-nocheck

import { handleSession } from 'svelte-kit-cookie-session';
import { settings } from '$lib/stores';

let lifetime;
settings.subscribe((val) => (lifetime = val.Session?.lifetime));

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

export const getSession = ({ locals }) => {
	return locals.session.data || {};
};

export async function handleError({ error, event }) {
	console.log(error, event);
}
