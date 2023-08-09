<script lang="ts">
  import './_meta.scss';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { localeFormat, isToday, INBOX, SENT } from '$lib/utils';
  import { onMount, onDestroy, createEventDispatcher, tick, getContext } from 'svelte';
  import UserGraphic from './_UserGraphic.svelte';
  import { usersFoundation } from '$lib/stores';
  import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { locale } from 'svelte-i18n';
  import type { Mail } from '$lib/types';
  import type { UserFoundation } from '$lib/classes/repos/types';

  export let mail: Mail;
  export let type: string | null;
  export { className as class };
  export let selected = false;
  export let selection: Mail | null | undefined;
  export let userId: string;

  const dispatch = createEventDispatcher();

  let userItems:
    | string
    | string[]
    | (
        | UserFoundation
        | {
            email: string;
          }
      )[] = [];
  let created = '';
  let className = '';
  let anchorElement: HTMLAnchorElement;
  let willBeDeleted = false;

  $: dateFormat =
    $locale?.indexOf('de') != -1
      ? isToday(parsedMail?.created || new Date(1970))
        ? 'HH:mm'
        : 'dd.MM yy HH:mm'
      : isToday(parsedMail?.created || new Date(1970))
      ? 'hh:mm a'
      : 'yy-MM-dd hh:mm a';

  $: created = localeFormat(new Date(parsedMail?.created || 1970), dateFormat);
  $: parsedMail = parseMail();
  $: userDisplayName = (user: any) => user.name || user.email;
  $: unread = mail?._read === false;
  $: browser && selected && focusHandler();

  onMount(() => {
    if (parsedMail) {
      userItems = type === INBOX ? parsedMail._from : type === SENT ? parsedMail._to : [];
    }
  });

  onDestroy(() => {
    if (willBeDeleted) dispatch('mail:destroyed', { id: mail.id, type });
  });

  async function focusHandler() {
    await tick();
    selection = mail;

    if (type === INBOX) {
      unread && dispatch('mail:toggleRead', { id: mail.id, read: true });
    }
    anchorElement.focus();
  }

  function keydownHandler(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      willBeDeleted = true;
      dispatch('mail:delete', { id: selection?.id });
    }
  }

  function href() {
    if (parsedMail) $page.url.searchParams.set('mail_id', parsedMail.id);
    return $page.url.href;
  }

  function parseMail() {
    if (type === INBOX) return parseInbox(mail);
    if (type === SENT) return parseSent(mail);
  }

  function parseInbox(mail: Mail) {
    const json = JSON.parse(mail.message);
    return {
      id: mail.id,
      _from: parseUsernames([mail._from]),
      _to: [userId],
      subject: json.subject,
      _read: mail._read,
      created: mail.created
    };
  }

  function parseSent(mail: Mail) {
    let json = JSON.parse(mail.message);
    let _to = mail._to.split(';');
    return {
      id: mail.id,
      _from: mail._from,
      _to: parseUsernames(_to),
      subject: json.subject,
      created: mail.created,
      _read: true
    };
  }

  const parseUsernames = (senders: string[]) => {
    let user;
    let items: ({ email: string } | UserFoundation)[] = [];
    for (let sender of senders) {
      user = $usersFoundation?.find((user: UserFoundation) => user.email === sender);
      items.push(user ? { ...user } : { email: sender });
    }
    return items;
  };
</script>

<Item on:focus={focusHandler} class="{className} {mail?._read ? 'read' : 'unread'}" {selected}
  ><a
    bind:this={anchorElement}
    on:keydown={keydownHandler}
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
          <span class="mr-3 mail-list" class:unread>{userDisplayName(user)}</span>
        {/each}
      </PrimaryText>
      <SecondaryText style="display: flex; align-items: baseline; justify-content: center;">
        <span class="subject">{parsedMail?.subject || '--'}</span><span class="date-created"
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
