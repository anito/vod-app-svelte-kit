<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { createEventDispatcher, getContext, onMount, tick } from 'svelte';
  import { ASC, DESC } from '$lib/utils';
  import { SimpleMailCard } from '$lib/components';
  import List from '@smui/list';
  import { _ } from 'svelte-i18n';
  import type { Mail } from '$lib/types';
  import type { Writable } from 'svelte/store';

  export let selection: Mail | null;
  export let sort = DESC;
  export let selectionIndex: number;
  export let loading: boolean = false;

  const dispatch = createEventDispatcher();
  const sortByDate = (
    a: { created: string | number | Date },
    b: { created: string | number | Date }
  ) => sortBit * (new Date(a.created).getTime() - new Date(b.created).getTime());
  const { getActiveMailStore, getMailStore } = getContext('mail-store') as {
    getActiveMailStore: () => Writable<any>;
    getMailStore: (arg0: string) => Writable<Mail[]>;
  };
  const currentStore: Writable<Writable<Mail[]>> = getActiveMailStore();

  let list: List;
  let focusItemAtIndex: (arg0: number) => void;
  let items: any[];

  $: mailStore = $currentStore;
  $: userId = $page.params.slug;
  $: sortBit = sort === DESC ? -1 : sort === ASC ? 1 : 0;
  $: activeItem = $page.url.searchParams.get('active');
  $: mailId = $page.url.searchParams.get('mail_id');
  $: mails = () => {
    sort;
    return $mailStore.sort(sortByDate);
  };

  onMount(() => {});

  async function mailDeletedHandler() {
    await tick();

    if (!list || !items.length) {
      selection = null;
      return;
    }

    let index = parseInt(list.getSelectedIndex().toString());

    if (items.length >= index + 1) {
      selectionIndex = index;
    } else {
      selectionIndex = index - 1;
    }

    const getAnchor = (idx: number) => {
      const listEl: HTMLLIElement = items[idx]?.element;
      return listEl?.querySelector('a');
    };

    const href = getAnchor(selectionIndex)?.href;
    if (href) {
      await goto(href);
      await tick();
      items[selectionIndex].selected = true;
      focusItemAtIndex(selectionIndex);
    }
  }

  function receiveListMethods({ detail }: CustomEvent) {
    ({ focusItemAtIndex, items } = detail);
  }
</script>

<div class:loading>
  <List
    bind:this={list}
    on:SMUIList:mount={receiveListMethods}
    class="mail-list list-{activeItem}"
    twoLine
    avatarList
    singleSelection
  >
    {#each mails() as mail (mail.id)}
      <SimpleMailCard
        bind:selection
        on:mail:delete
        on:mail:toggleRead
        on:mail:destroyed={mailDeletedHandler}
        selected={mail.id === mailId}
        type={activeItem}
        {userId}
        {mail}
      />
    {/each}
  </List>
</div>

<style>
  .loading {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
