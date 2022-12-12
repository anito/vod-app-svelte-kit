<script>
  import { page } from '$app/stores';
  import { getContext, onMount, tick } from 'svelte';
  import { usersFoundation } from '$lib/stores';
  import { ASC, DESC, INBOX, SENT } from '$lib/utils';
  import List from '@smui/list';
  import { SimpleMailCard, SvgIcon } from '$lib/components';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;
  /** @type {string} */
  export let sort = DESC;
  /** @type {number | undefined} */
  export let selectionIndex;
  /** @type {Promise<any>} */
  export let waitForData;

  /**
   *
   * @param {import('$lib/types').Mail} a
   * @param {import('$lib/types').Mail} b
   */
  const sortByDate = (a, b) =>
    sortBit * (new Date(a.created).getTime() - new Date(b.created).getTime());
  const { getMailStore } = getContext('mail-store');

  const currentStore = getMailStore();

  /** @type {import("@smui/list").ListComponentDev} */
  let list;
  /**
   * @type {(arg0: import("@material/list").MDCListIndex) => void}
   */
  let focusItemAtIndex;
  /** @type {Array<any>} */
  let items;

  $: mailStore = $currentStore;
  $: userId = $page.params.slug;
  $: sortBit = sort === DESC ? -1 : sort === ASC ? 1 : 0;
  $: activeItem = $page.url.searchParams.get('active');
  $: selectionMailId = $page.url.searchParams.get('mail_id');

  onMount(() => {});

  /**
   * Find the user for each email address in the email
   * @param {string[]} sender
   */
  const parseUsernames = (sender) => {
    let item;
    /**
     * @type {string[]}
     */
    let items = [];
    sender.forEach((/** @type {string} */ email) => {
      item = $usersFoundation?.find(
        /** @param {import('$lib/types').UserFoundation} user */
        (user) => user.email === email
      );
      items.push(item ? { ...item } : { email });
    });
    return items;
  };

  /** @param {import('$lib/types').Mail} mail */
  function parseMail(mail) {
    if (activeItem === INBOX) return parseInbox(mail);
    if (activeItem === SENT) return parseSent(mail);
  }

  /** @param {import('$lib/types').Mail} mail */
  function parseInbox(mail) {
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

  /** @param {import('$lib/types').Mail} mail */
  function parseSent(mail) {
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

  /** @param {any} param0 */
  function receiveListMethods({ detail }) {
    // @ts-ignore
    ({ focusItemAtIndex, items } = { ...detail });
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
      class="mails-list list-{activeItem}"
      on:SMUIList:mount={receiveListMethods}
      bind:selectedIndex={selectionIndex}
      twoLine
      avatarList
      singleSelection
    >
      {#each sort && $mailStore.sort(sortByDate) as mail (mail.id)}
        <SimpleMailCard
          on:mail:delete
          on:mail:toggleRead
          on:mail:destroyed={mailDestroyedHandler}
          bind:selection
          selected={mail.id === selectionMailId}
          mail={parseMail(mail)}
          type={activeItem}
        />
      {/each}
    </List>
  {:catch reason}
    {reason}
  {/await}
{/if}

<style>
</style>
