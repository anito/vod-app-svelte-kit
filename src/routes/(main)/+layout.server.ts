import { redirect } from '@sveltejs/kit';
import { USER } from '$lib/utils';
import type { LayoutServerLoadEvent } from './$types';

export async function load({
  depends,
  locals: { session, usersRepo, videosRepo, videosAllRepo, imagesRepo },
  cookies
}: LayoutServerLoadEvent) {
  if (!session.data.user) {
    throw redirect(301, '/');
  }

  const { role = USER, user: sessionUser } = session.data;
  const id = sessionUser?.id;
  const token = sessionUser?.jwt;
  const videos = await videosRepo.getAll({ token });
  const images = await imagesRepo.getAll({ token });
  const users = await usersRepo.getAll({ token });
  const user = (id && (await usersRepo.get(id, { token }))) || null;
  const videosAll = role === USER && (await videosAllRepo.getAll({ token }));
  const pagination = {
    users: users.pagination,
    videos: videos.pagination,
    images: images.pagination,
    videosAll: videosAll ? videosAll.pagination : {}
  };

  depends('app:main');
  cookies.set('pagination', JSON.stringify(pagination), { path: '/' });

  return {
    user,
    users,
    videos,
    images,
    videosAll,
    pagination
  };
}
