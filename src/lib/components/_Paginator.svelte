<script>
  import './_button.scss';
  import { enhance } from '$app/forms';
  import { writable } from 'svelte/store';
  import { createEventDispatcher, onMount, tick } from 'svelte';
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

  const dispatch = createEventDispatcher();

  $: paginator = (pagination || store) && sync();
  $: page_data = paginator && pageData();

  onMount(() => {
    paginator?.has_next_page && setTimeout(() => scrollIntoView(), 200);
  });

  function pageData() {
    paginator = { ...paginator, has_next_page: !($store.length === paginator.count) };
    const { count, page_count, current_page, has_next_page, limit } = paginator;
    const rest = count % limit;
    const next_count = page_count - current_page === 1 ? rest || limit : limit;
    const loaded_count = $store.length;
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
      let ok = true;
      const { count: paginator_count, has_next_page: paginator_has_next_page } = PAGINATORS.get(id);
      if (!paginator_has_next_page && paginator_count !== $store.length) ok = false;

      // we don't know which fires first, store or pagination
      // so pagination could be still undefined here
      try {
        const { count } = pagination;
        if (count !== paginator_count) ok = false;
      } catch (e) {}

      if (ok === true) {
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

  async function scrollIntoView() {
    await tick();
    const appendix = document.documentElement.querySelector(`.paginator-appendix-${id}`);
    appendix?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
</script>

<li class="paginator-appendix paginator-appendix-{id}">
  <form
    {action}
    method="POST"
    use:enhance={() => {
      return /** @param {{result: import('@sveltejs/kit').ActionResult | any}} param */ async ({
        result
      }) => {
        if (result.type === 'success') {
          const { data: resultData } = result;
          const { success, data } = resultData;
          success && store.add(data);
          PAGINATORS.set(id, resultData.pagination);
          paginator = PAGINATORS.get(id);
          setTimeout(() => scrollIntoView(), 200);
          dispatch('paginator:loaded', id);
        }
      };
    }}
  >
    {#if paginator?.has_next_page}
      <Button variant="raised" class="button-shaped-round" {style}>
        <input type="hidden" name="page" value={page_data.next_page} />
        <Label
          style="margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
          >{$_('text.more')}</Label
        >
        <Icon style="margin-bottom: 5px;" class="material-icons">download</Icon>
        <small class="paginator-indicator"
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
</li>

<style>
  .paginator-appendix {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .paginator-appendix::after {
    content: '';
    height: 90px;
  }
  small.paginator-indicator {
    position: absolute;
    font-size: 0.5em;
    bottom: 5px;
    line-height: 1em;
  }
</style>