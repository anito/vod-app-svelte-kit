import { json } from '@sveltejs/kit';

export const GET = async ({
  locals: { videosAllRepo, session },
  url,
  cookies,
}) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');

  let videosAll;
  let id;
  if ((id = url.searchParams.get('id'))) {
    videosAll = await videosAllRepo.get(id, { token });
  } else {
    let limit;
    if (url.searchParams.has('auto')) {
      const pagination = JSON.parse(cookies.get('pagination') || '{}');
      const { current_page, count, limit: _limit }: any = pagination.videosAll;
      if (current_page && _limit && count) {
        limit = Math.min(current_page * _limit, count);
      }
    }
    videosAll = await videosAllRepo.getAll({ page, limit, token });
  }

  return json(videosAll);
};

export const POST = async ({
  locals: { videosAllRepo, session },
  request,
  cookies,
}) => {
  const { user } = session.data;
  const token = user?.jwt;
  const options = await request.json(); // { match, limit, auto }
  if (options.auto) {
    const pagination = JSON.parse(cookies.get('pagination') || '{}');
    const { current_page, count, limit }: any = pagination.videosAll;
    if (current_page && limit && count) {
      options.limit = Math.min(current_page * limit, count);
    }
  }
  const videosAll = await videosAllRepo.getAll({ ...options, token });

  return json(videosAll);
};
