import { dev } from '$app/env';
import { handleSession } from 'svelte-kit-cookie-session';
import { getAuxSession } from '$lib/utils';
import { UsersRepo, VideosRepo, ImagesRepo, VideosAllRepo } from '$lib/repos';

export const handle = handleSession(
	{
		secret: 'ALKDSFH§%&24LKFDJSD/&$§&ÖLDKFJSDL§&%$&=&=SLKAF'
	},
	async ({ event, resolve }) => {
		dev && (process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0);

		const token = event.locals.session.data.user?.jwt;
		const usersRepo = UsersRepo.getInstance().setToken(token);
		const videosRepo = VideosRepo.getInstance().setToken(token);
		const imagesRepo = ImagesRepo.getInstance().setToken(token);
		const videosAllRepo = VideosAllRepo.getInstance().setToken(token);
		event.locals.usersRepo = usersRepo;
		event.locals.videosRepo = videosRepo;
		event.locals.imagesRepo = imagesRepo;
		event.locals.videosAllRepo = videosAllRepo;

		return await resolve(event);
	}
);

// own implementaion (deactivated)
export const _getSession = getAuxSession();

export async function externalFetch(request: { status: number }) {
	console.log('#externalFetch', request);
	request.status = 200;
	return request;
}

export const getSession = ({ locals }) => {
	return locals.session.data;
};

export async function handleError({ error, event }) {
	console.log('ERROR (hooks.js)', error, event);
}
