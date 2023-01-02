<script context="module">
  const PAGINATORS = new Map();
  export const clear = PAGINATORS.clear();
</script>

<script>
  import './_button.scss';
  import { enhance } from '$app/forms';
  import { writable } from 'svelte/store';
  import { createEventDispatcher, tick } from 'svelte';
  import Button, { Label, Icon } from '@smui/button';
  import { _ } from 'svelte-i18n';
  import IconButton from '@smui/icon-button';

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
  export let icon = '';
  export let indicator = false;
  export let label = true;

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

  $: paginator = (pagination || store) && sync();
  $: page_data = paginator && pageData();

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

<li class="paginator-appendix paginator-appendix-{id}" class:indicator>
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
    <input type="hidden" name="page" value={page_data.next_page} />
    {#if paginator?.has_next_page}
      {#if label}
        <Button
          variant="unelevated"
          color="secondary"
          class="button-shaped-round load-more"
          {style}
        >
          <Label
            class="label"
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
            >{$_('text.more')}</Label
          >
          {#if indicator}
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
          {/if}
        </Button>
      {/if}
      {#if icon}
        <IconButton class="material-icons">
          {icon}</IconButton
        >
      {/if}
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
    font-size: 0.6em;
    bottom: 5px;
    line-height: 1em;
  }
  .paginator-appendix.indicator :global(.label) {
    margin-bottom: 5px;
  }
</style>
