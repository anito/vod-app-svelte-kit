<script>
  import './_meta.scss';
  import { localeFormat, isToday, INBOX, SENT } from '$lib/utils';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import UserGraphic from './_UserGraphic.svelte';
  import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { locale } from 'svelte-i18n';
  import { page } from '$app/stores';

  /** @type {import('$lib/types').Mail | null | undefined} */
  export let selection;
  /**
   * @type {any | null | undefined}
   */
  export let mail;
  /** @type {string | null} */
  export let type;
  export { className as class };

  const dispatch = createEventDispatcher();

  /** @type {any | never[]} */
  let userItems = [];
  let created = '';
  let className = '';
  /** @type {HTMLAnchorElement} */
  let anchorElement;

  $: unread = !mail?._read;
  $: mail_id = $page.url.searchParams.get('mail_id');
  $: dateFormat =
    /** @type {string | null | undefined} */
    $locale?.indexOf('de') != -1
      ? isToday(mail?.created)
        ? 'HH:mm'
        : 'dd.MM yy HH:mm'
      : isToday(mail?.created)
      ? 'hh:mm a'
      : 'yy-MM-dd hh:mm a';

  $: created = localeFormat(new Date(mail?.created), dateFormat);
  $: mail && mail?.id === mail_id && (selection = mail) && selection;

  onMount(() => {
    userItems = type === INBOX ? mail?._from : type === SENT ? mail?._to : [];
    setTimeout(() => {}, 100);
  });

  onDestroy(() => {
    selection = null;
    userItems = [];
    dispatch('mail:destroyed');
  });

  function focusHandler() {
    selection = mail;
    if (type === INBOX) {
      unread && dispatch('mail:toggleRead', { selection });
    }
  }

  /** @param {KeyboardEvent} event*/
  function keydownHandler(event) {
    const isBackspace = event.key === 'Backspace' || event.keyCode === 8;
    if (isBackspace) {
      dispatch('mail:delete', { selection });
    }
  }

  function createHref() {
    $page.url.searchParams.set('mail_id', mail?.id);
    return $page.url.href;
  }
</script>

<Item class="{className} {mail?._read ? 'read' : 'unread'}" selected={mail_id === mail?.id}
  ><a
    bind:this={anchorElement}
    on:focus={() => focusHandler()}
    on:keydown={(e) => keydownHandler(e)}
    href={createHref()}
    tabindex="0"
    class="flex flex-1 item-inner"
  >
    <div class="staggered">
      {#each userItems as user, i}
        <UserGraphic size="30" {user} style={`z-index: ${10 - i};`} />
      {/each}
    </div>
    <Text style="flex: 1; align-self: auto;">
      <PrimaryText style="display: flex;">
        {#each userItems as user}
          <span class="mr-3 mail-list" class:unread>{user.name || user.email}</span>
        {/each}
      </PrimaryText>
      <SecondaryText style="display: flex; align-items: baseline; justify-content: center;">
        <span class="subject">{mail?.subject || '--'}</span><span class="date-created"
          >{created}</span
        >
      </SecondaryText>
    </Text>
  </a>
</Item>

<style>
  .unread {
    font-weight: 700;
  }
  .mail-list {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    align-self: unset;
  }
  .subject {
    flex: 1 0 60%;
    padding-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .date-created {
    font-size: 0.8em;
    flex: 1 0 40%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: end;
  }
  :global(.next-active) {
    background: chocolate;
  }
  .staggered :global(.user-graphics-outer:not(:first-child)) {
    margin-left: -36px;
  }
  .item-inner {
    border-bottom: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: 100%;
    align-items: center;
  }
</style>
