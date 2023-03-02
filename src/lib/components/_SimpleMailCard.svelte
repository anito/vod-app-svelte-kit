<script lang="ts">
  import './_meta.scss';
  import { localeFormat, isToday, INBOX, SENT } from '$lib/utils';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import UserGraphic from './_UserGraphic.svelte';
  import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { locale } from 'svelte-i18n';
  import { page } from '$app/stores';
  import type { Mail } from '$lib/types';
  import type { User } from '$lib/classes/repos/types';

  export let mail: Mail | undefined;
  export let type: string | null;
  export { className as class };
  export let selected = false;

  const dispatch = createEventDispatcher();

  let userItems: User[] = [];
  let created = '';
  let className = '';
  let anchorElement: HTMLAnchorElement;
  export let selection: Mail | null | undefined;

  $: unread = !mail?._read;
  $: dateFormat =
    $locale?.indexOf('de') != -1
      ? isToday(mail?.created || new Date(1970))
        ? 'HH:mm'
        : 'dd.MM yy HH:mm'
      : isToday(mail?.created || new Date(1970))
      ? 'hh:mm a'
      : 'yy-MM-dd hh:mm a';

  $: created = localeFormat(new Date(mail?.created || 1970), dateFormat);

  onMount(() => {
    userItems = type === INBOX ? mail?._from : type === SENT ? mail?._to : [];
    selected && anchorElement.focus();
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

  function keydownHandler(event: KeyboardEvent) {
    const isBackspace = event.key === 'Backspace';
    if (isBackspace) {
      dispatch('mail:delete', { selection });
    }
  }

  function href() {
    $page.url.searchParams.set('mail_id', mail?.id);
    return $page.url.href;
  }
</script>

<Item
  on:focus={() => focusHandler()}
  class="{className} {mail?._read ? 'read' : 'unread'}"
  {selected}
  ><a
    on:focus={() => focusHandler()}
    bind:this={anchorElement}
    on:keydown={(e) => keydownHandler(e)}
    href={href()}
    class="flex flex-1 item-inner"
  >
    <div class="staggered">
      {#each userItems as user, i}
        <UserGraphic size={30} {user} style={`z-index: ${10 - i};`} />
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
