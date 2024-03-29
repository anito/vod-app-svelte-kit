<script context="module">
  const PAGINATORS = new Map();
  export const clear = PAGINATORS.clear();
</script>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidate } from '$app/navigation';
  import { writable } from 'svelte/store';
  import { createEventDispatcher, tick } from 'svelte';
  import Button, { Label, Icon } from '@smui/button';
  import { _ } from 'svelte-i18n';
  import IconButton from '@smui/icon-button';
  import type { ActionResult } from '@sveltejs/kit';
  import type { Pagination } from '$lib/classes/repos/types';

  export let pagination: Pagination;
  export let id: string;
  export let style = '';
  export let action = '';
  export let store: any = createStore();
  export let icon = 'rotate_right';
  export let indicator = false;
  export let type: 'icon' | 'label' = 'label';

  if (!id) {
    throw 'No Paginator ID specified';
  }
  if (!action) {
    throw 'No Paginator action specified';
  }
  if (!store.add) {
    throw 'Store must implement an "add" method';
  }

  const dispatch = createEventDispatcher();

  let paginator: any;

  $: (pagination || store) && (paginator = sync());
  $: page_data = paginator && pageData();

  function pageData() {
    paginator = { ...paginator, has_next_page: !($store?.length === paginator.count) };
    const { count, page_count, current_page, has_next_page, limit } = paginator;
    const next_count = has_next_page
      ? page_count - current_page === 1
        ? count % limit || limit
        : limit
      : 0;
    const loaded_count = $store?.length;
    const remaining_count = Math.max(0, count - limit * current_page);
    return {
      ...paginator,
      remaining_count,
      next_count,
      loaded_count
    };
  }

  function sync(): any {
    if (PAGINATORS.has(id)) {
      let outofsync = false;
      // we don't know which fires first, store or pagination
      // so pagination could still be undefined here
      try {
        const { count: paginator_count, has_next_page: paginator_has_next_page } =
          PAGINATORS.get(id);
        if (!paginator_has_next_page && paginator_count !== $store.length) outofsync = true;
        if (pagination.count !== paginator_count) outofsync = true;
      } catch (e) {}

      if (outofsync) {
        PAGINATORS.delete(id);
        return sync();
      }
    }
    pagination && PAGINATORS.set(id, pagination);
    return PAGINATORS.get(id);
  }

  function createStore() {
    const { update, subscribe } = writable([] as never[]);
    return {
      add: (values: any[]) =>
        update((items) => {
          for (const value of values) {
            if (!items.find((item: any) => value.id === item.id))
              items = [...items, value] as never[];
          }
          return items;
        }),
      subscribe
    };
  }

  async function scrollIntoView() {
    await tick();
    const control = document.documentElement.querySelector(`.paginator-${id}`);
    control?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  async function formHandler() {
    return async ({ result }: { result: ActionResult }) => {
      if (result.type === 'success') {
        const { data, pagination }: any = { ...result.data };
        if (!pagination) {
          PAGINATORS.delete(id);
        } else {
          data && store.add(data);
          pagination && PAGINATORS.set(id, pagination);
          paginator = PAGINATORS.get(id);
          setTimeout(() => scrollIntoView(), 200);
          dispatch('paginator:loaded', id);
        }
        await invalidate('app:session');
      }
    };
  }
</script>

<li class="paginator paginator-{id}" class:indicator>
  <form {action} method="POST" use:enhance={formHandler}>
    {#if paginator?.has_next_page}
      {#if type === 'label'}
        <Button variant="unelevated" color="primary" class="button-shaped-round load-more" {style}>
          <Label
            class="label"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
            >{$_('text.more')}</Label
          >
          {#if indicator}
            <small class="indicator"
              >{$_('text.paginator-indicator', {
                values: {
                  next_count: page_data.next_count,
                  current_page: page_data.current_page,
                  count: page_data.count,
                  loaded_count: page_data.loaded_count
                }
              })}</small
            >
          {/if}
        </Button>
      {:else if type === 'icon'}
        <IconButton class="material-icons">
          {icon}</IconButton
        >
      {/if}
    {/if}
  </form>
</li>

<style lang="scss">
  .paginator {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .paginator::after {
    content: '';
    height: 90px;
  }
  .paginator.indicator :global(.label) {
    margin-bottom: 8px;
  }
</style>
