import { dev } from '$app/env';
import { handleSession } from 'svelte-kit-cookie-session';
import { getAuxSession } from '$lib/utils';
import { UsersRepo } from '$lib/repos/users';
import { VideosRepo } from '$lib/repos/videos';
import { ImagesRepo } from '$lib/repos/images';

export const handle = handleSession(
	{
		secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
	},
	async ({ event, resolve }) => {
		dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0);

		event.locals.usersRepo = new UsersRepo(event, 'users');
		event.locals.videosRepo = new VideosRepo(event, 'videos');
		event.locals.imagesRepo = new ImagesRepo(event, 'images');

		return await resolve(event);
	}
);

// own implementaion (deactivated)
export const _getSession = getAuxSession();

export async function externalFetch(request: { status: number }) {
	// console.log('#externalFetch', request);
	request.status = 200;
	return request;
}

export const getSession = ({ locals }) => {
	return locals.session.data;
};

export async function handleError({ error, event }) {
	console.log('ERROR (hooks.js)', error, event);
}
