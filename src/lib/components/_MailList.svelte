<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getContext, onMount, SvelteComponent, tick, type ComponentType } from 'svelte';
  import { usersFoundation } from '$lib/stores';
  import { ASC, DESC, INBOX, SENT } from '$lib/utils';
  import { FlexContainer, SimpleMailCard, SvgIcon } from '$lib/components';
  import List from '@smui/list';
  import { _ } from 'svelte-i18n';
  import type { SmuiElementMap } from '@smui/common';
  import type { Mail } from '$lib/types';
  import type { UserFoundation } from '$lib/classes/repos/types';

  export let selection: Mail | undefined;
  export let sort = DESC;
  export let selectionIndex: number;
  export let waitForData: Promise<any>;

  const sortByDate = (
    a: { created: string | number | Date },
    b: { created: string | number | Date }
  ) => sortBit * (new Date(a.created).getTime() - new Date(b.created).getTime());
  const { getMailStore }: any = getContext('mail-store');

  const currentStore = getMailStore();

  let list: List<keyof SmuiElementMap, ComponentType<SvelteComponent>>;
  let focusItemAtIndex: (arg0: number) => void;
  let items: string | any[];

  $: mailStore = $currentStore;
  $: userId = $page.params.slug;
  $: sortBit = sort === DESC ? -1 : sort === ASC ? 1 : 0;
  $: activeItem = $page.url.searchParams.get('active');
  $: selectionMailId = $page.url.searchParams.get('mail_id');

  onMount(() => {});

  const parseUsernames = (sender: string[]) => {
    let item;
    let items: ({ email: string } | UserFoundation)[] = [];
    sender.forEach((email) => {
      item = $usersFoundation?.find((user: UserFoundation) => user.email === email);
      items.push(item ? { ...item } : { email });
    });
    return items;
  };

  function parseMail(mail: Mail) {
    if (activeItem === INBOX) return parseInbox(mail);
    if (activeItem === SENT) return parseSent(mail);
  }

  function parseInbox(mail: Mail) {
    let message = JSON.parse(mail.message);
    return {
      id: mail.id,
      _from: parseUsernames([mail._from]),
      _to: [userId],
      message: message.message,
      subject: message.subject,
      _read: mail._read,
      created: mail.created
    };
  }

  function parseSent(mail: Mail) {
    let message = JSON.parse(mail.message);
    let _to = mail._to.split(';');
    return {
      id: mail.id,
      _from: mail._from,
      _to: parseUsernames(_to),
      message: message.message,
      subject: message.subject,
      created: mail.created,
      _read: true
    };
  }

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
    <div class="loader flex justify-center">
      <SvgIcon name="animated-loader-3" size={50} fillColor="var(--primary)" class="mr-2" />
    </div>
  {:then}
    <List
      bind:this={list}
      bind:selectedIndex={selectionIndex}
      on:SMUIList:mount={receiveListMethods}
      class="mails-list list-{activeItem}"
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
          selected={mail.id === selectionMailId}
          mail={parseMail(mail)}
          type={activeItem}
        />
      {/each}
    </List>
  {:catch reason}
    <FlexContainer style="grid-area: one;">
      {reason}
    </FlexContainer>
  {/await}
{/if}

<style>
</style>
