import type { Cookies } from '@sveltejs/kit';

export function getPagination(cookies: Cookies) {
  return JSON.parse(cookies.get('pagination') || '{}');
}

export function setPaginationItem({
  name,
  data,
  cookies
}: {
  name: string;
  data: any;
  cookies: Cookies;
}) {
  const pagination = getPagination(cookies);
  const { current_page, has_next_page }: any = data || {};
  cookies.set(
    'pagination',
    JSON.stringify({
      ...pagination,
      [name]: {
        next_page: has_next_page ? current_page + 1 : undefined,
        ...data
      }
    }),
    { path: '/' }
  );
}
