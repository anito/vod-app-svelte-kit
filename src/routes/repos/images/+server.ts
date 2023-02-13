import { json } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { pagination } from '$lib/stores';
import { paginationItems, setPaginationItem } from '$lib/utils';
import type { RequestEvent } from './$types';

const LIMIT = '9';

export const GET = async ({ locals: { imagesRepo, session }, url, cookies }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const page: number = parseInt(url.searchParams.get('page') || '1');
  let countlimit: number;

  let images;
  if (url.searchParams.has('id')) {
    const id = url.searchParams.get('id');
    images = await imagesRepo.get(id, { token });
  } else {
    // Use last pagination data (from cookie) if the query parameter "currentpage" has been passed
    if (url.searchParams.has('currentpage') && paginationItems.images) {
      const { current_page, count, limit }: any = paginationItems.images;
      countlimit = Math.min(current_page * limit, count);
    } else {
      countlimit = parseInt(url.searchParams.get('limit') || LIMIT);
    }
    images = await imagesRepo.getAll({ page, limit: countlimit, token }, cookies);
    if (images.pagination) setPaginationItem({ name: 'images', data: images.pagination });
  }
  return json(images);
};

export const POST = async ({ locals: { imagesRepo, session }, request }: RequestEvent) => {
  const { user } = session.data;
  const token = user?.jwt;
  const { match, limit } = await request.json();
  const images = await imagesRepo.getAll({ match, token, limit });
  if (images.pagination) setPaginationItem({ name: 'images', data: images.pagination });

  return json(images);
};
