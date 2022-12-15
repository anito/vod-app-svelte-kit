<script>
  import './_button.scss';
  import { writable } from 'svelte/store';
  import { enhance } from '$app/forms';
  import Button, { Label, Icon } from '@smui/button';
  import { PAGINATORS } from '$lib/utils';
  import { _ } from 'svelte-i18n';

  /**
   * @type {any}
   */
  export let pagination;
  /**
   * @type {string}
   */
  export let id;
  export let style = '';
  export let action = '';
  export let store = createStore();
  if (!id) {
    throw 'No Paginator ID specified';
  }
  if (!action) {
    throw 'No Paginator action specified';
  }

  $: paginator = (pagination || store) && sync();
  $: page_data = paginator && pageData();

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

  function sync() {
    if (!PAGINATORS.has(id)) {
      PAGINATORS.set(id, pagination);
      return PAGINATORS.get(id);
    } else {
      const { count: paginator_count } = PAGINATORS.get(id);
      const { count: from_load_count } = pagination;
      if (from_load_count === paginator_count) {
        return PAGINATORS.get(id);
      }
      PAGINATORS.delete(id);
      sync();
    }
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
