import { pagination } from '$lib/stores';

export let paginationItems: any;

pagination.subscribe((items) => {
  paginationItems = items;
});

export function setPaginationItem({ name, data }: { name: string; data: any }) {
  const { current_page, has_next_page }: any = data || {};
  pagination.update({
    name,
    data: {
      next_page: has_next_page ? current_page + 1 : undefined,
      ...data
    }
  });
}
