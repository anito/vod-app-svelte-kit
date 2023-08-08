<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { getContext, onMount, tick } from 'svelte';
  import { ASC, DESC } from '$lib/utils';
  import { FlexContainer, SimpleMailCard, SvgIcon } from '$lib/components';
  import List from '@smui/list';
  import { _ } from 'svelte-i18n';
  import type { Mail } from '$lib/types';

  export let selection: Mail | undefined;
  export let sort = DESC;
  export let selectionIndex: number;
  export let waitForData: Promise<any>;
  export let loading: boolean = false;

  const sortByDate = (
    a: { created: string | number | Date },
    b: { created: string | number | Date }
  ) => sortBit * (new Date(a.created).getTime() - new Date(b.created).getTime());
  const { getMailStore }: any = getContext('mail-store');
  const currentStore = getMailStore();

  let list: List;
  let focusItemAtIndex: (arg0: number) => void;
  let items: string | any[];

  $: mailStore = $currentStore;
  $: userId = $page.params.slug;
  $: userId && (loading = true);
  $: sortBit = sort === DESC ? -1 : sort === ASC ? 1 : 0;
  $: activeItem = $page.url.searchParams.get('active');
  $: ((idx) => setTimeout(() => focusItemAtIndex?.(idx), 100))(selectionIndex);

  onMount(() => {});

  async function mailDestroyedHandler() {
    await tick();

    if (!list || !items.length) return;
    let index = parseInt(list.getSelectedIndex().toString());

    if (items.length >= index + 1) {
      selectionIndex = index;
    } else {
      selectionIndex = index - 1;
    }

    const anchor = items[selectionIndex]?.element.querySelector('a');
    const href = anchor?.href;
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

{#if $mailStore}
  {#await waitForData}
    <div in:fly={{ y: -50 }} out:fly={{ y: -50 }} class="loader flex justify-center">
      <SvgIcon name="animated-loader-3" size={50} fillColor="var(--primary)" class="mr-2" />
    </div>
  {:catch reason}
    <FlexContainer style="grid-area: one;">
      {reason}
    </FlexContainer>
  {/await}
  <div class:loading>
    <List
      bind:this={list}
      bind:selectedIndex={selectionIndex}
      on:SMUIList:mount={receiveListMethods}
      class="mail-list list-{activeItem}"
      twoLine
      avatarList
      singleSelection
    >
      {#each sort && $mailStore.sort(sortByDate) as mail (mail.id)}
        <SimpleMailCard
          bind:selection
          on:mail:delete
          on:mail:toggleRead
          on:mail:destroyed={mailDestroyedHandler}
          selected={mail.id === selection?.id}
          type={activeItem}
          {userId}
          {mail}
        />
      {/each}
    </List>
  </div>
{/if}

<style lang="scss">
  .loader {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    transform: translateY(0);
    transition: transform 0.3s ease-in;
    background-color: var(--mdc-theme-surface, #ffffff);
  }
  .loading {
    opacity: .5;
    pointer-events: none;
  }
</style>
