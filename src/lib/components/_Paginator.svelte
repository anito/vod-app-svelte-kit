<script>
  import './_button.scss';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import Button, { Label, Icon } from '@smui/button';
  import { PAGINATORS } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  /**
   * @type {any}
   */
  export let pagination;
  export let style = '';
  export let action = '';
  export let store = createStore();
  /**
   * @type {string}
   */
  export let id;
  if (!id) {
    throw 'No Paginator ID specified';
  }
  if (!action) {
    throw 'No Paginator action specified';
  }

  /**
   * @type {any}
   */
  let paginator;

  $: page_data = paginator && pageData();

  onMount(() => {
    let outOfSync = false;
    if (!PAGINATORS.has(id)) {
      PAGINATORS.set(id, pagination);
    } else {
      outOfSync = isOutOfSync();
    }
    paginator = !outOfSync ? PAGINATORS.get(id) : pagination;
  });

  function pageData() {
    const { count, page_count, current_page, has_next_page, limit } = paginator;
    const rest = count % limit;
    const next_count = page_count - current_page === 1 ? rest || limit : limit;
    const loaded_count = current_page * limit;
    const remaining_count = count - limit * current_page;
    const next_page = has_next_page ? current_page + 1 : current_page;
    return {
      next_page,
      remaining_count,
      next_count,
      loaded_count,
      ...paginator
    };
  }

  function isOutOfSync() {
    const { has_next_page, count } = PAGINATORS.get(id);
    return !has_next_page && $store.length < count;
  }

  function createStore() {
    const { update, subscribe } = writable();
    return {
      add: (/** @type {any} */ values) =>
        update((items) => {
          for (const value of values) {
            if (!items.find((/** @type {{ id: string; }} */ item) => value.id === item.id))
              items = [...items, value];
          }
          return items;
        }),
      subscribe
    };
  }
</script>

<form
  {action}
  method="POST"
  use:enhance={({ action }) => {
    return /** @param {{result: import('@sveltejs/kit').ActionResult | any}} param */ async ({
      result
    }) => {
      if (result.type === 'success') {
        const { data: resultData } = result;
        const { success, data } = resultData;
        success && store.add(data);
        PAGINATORS.set(id, resultData.pagination);
        paginator = PAGINATORS.get(id);
      }
    };
  }}
>
  {#if paginator?.has_next_page}
    <Button variant="raised" class="button-shaped-round" {style}>
      <input type="hidden" name="page" value={page_data.next_page} />
      <Label style="margin-bottom: 5px;">{$_('text.more')}</Label>
      <Icon style="margin-bottom: 5px;" class="material-icons">download</Icon>
      <small class="pagination-indicator"
        >{$_('text.paginator-indicator', {
          values: {
            next_count: page_data.next_count,
            current_page: page_data.current_page,
            count: page_data.count,
            loaded_count: page_data.loaded_count
          }
        })}</small
      >
    </Button>
  {/if}
</form>

<style>
  small.pagination-indicator {
    position: absolute;
    font-size: 0.5em;
    bottom: 5px;
    line-height: 1em;
  }
</style>
