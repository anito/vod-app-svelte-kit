import type { Actions } from '@sveltejs/kit';

export const actions = {
  more_videos: async ({ locals, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const page = (pagination.videos?.has_next_page && pagination.videos?.current_page + 1) || 1;
    const videos = await locals.videosRepo.getAll({
      page,
      token: locals.session.data.user?.jwt
    });
    const newPagination = { ...pagination, videos: videos.pagination };
    cookies.set('pagination', JSON.stringify(newPagination), { path: '/' });
    return videos;
  },
  more_videos_all: async ({ locals, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const page =
      (pagination.videosAll?.has_next_page && pagination.videosAll?.current_page + 1) || 1;
    const videosAll = await locals.videosAllRepo.getAll({
      page,
      token: locals.session.data.user?.jwt
    });
    const newPagination = { ...pagination, videosAll: videosAll.pagination };
    cookies.set('pagination', JSON.stringify(newPagination), { path: '/' });
    return videosAll;
  },
  more_images: async ({ locals, cookies }) => {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const page = (pagination.images?.has_next_page && pagination.images?.current_page + 1) || 1;
    const images = await locals.imagesRepo.getAll({
      page,
      token: locals.session.data.user?.jwt
    });
    const newPagination = { ...pagination, images: images.pagination };
    cookies.set('pagination', JSON.stringify(newPagination), { path: '/' });
    return images;
  }
} as Actions;
