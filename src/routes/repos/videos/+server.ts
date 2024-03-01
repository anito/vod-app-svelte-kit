import { json } from '@sveltejs/kit';

export const GET = async ({
  locals: { videosRepo, session },
  url,
  cookies,
}) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');

  let videos;
  let id;
  if ((id = url.searchParams.get('id'))) {
    videos = await videosRepo.get(id, { token });
  } else {
    let limit;
    if (url.searchParams.has('auto')) {
      const pagination = JSON.parse(cookies.get('pagination') || '{}');
      const { current_page, count, limit: _limit }: any = pagination.videos;
      if (current_page && _limit && count) {
        limit = Math.min(current_page * _limit, count);
      }
    }
    videos = await videosRepo.getAll({ page, limit, token });
  }
  return json(videos);
};

export const POST = async ({
  locals: { videosRepo, session },
  request,
  cookies,
}) => {
  const { user } = session.data;
  const token = user?.jwt;
  const options = await request.json(); // { match, limit, auto }
  if (options.auto) {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const { current_page, count, limit }: any = pagination.videos;
    if (current_page && limit && count) {
      options.limit = Math.min(current_page * limit, count);
    }
  }
  const videos = await videosRepo.getAll({ ...options, token });

  return json(videos);
};
