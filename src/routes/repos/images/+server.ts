import { json } from '@sveltejs/kit';

export const GET = async ({
  locals: { imagesRepo, session },
  url,
  cookies,
}) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');

  let images;
  let id;
  if ((id = url.searchParams.get('id'))) {
    images = await imagesRepo.get(id, { token });
  } else {
    let limit;
    if (url.searchParams.has('autolimit')) {
      const pagination = JSON.parse(cookies.get('pagination') || '{}');
      const { current_page, count, limit: pagelimit }: any = pagination.images;
      if (current_page && pagelimit && count) {
        limit = Math.min(current_page * pagelimit, count);
      }
    }
    images = await imagesRepo.getAll({ page, limit, token });
  }
  return json(images);
};

export const POST = async ({ locals: { imagesRepo, session }, request }) => {
  const { user } = session.data;
  const token = user?.jwt;
  const options = await request.json(); // { match, limit }
  const images = await imagesRepo.getAll({ ...options, token });
  return json(images);
};
