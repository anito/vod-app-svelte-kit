<script lang="ts">
  import './_meta.scss';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { localeFormat, isToday, INBOX, SENT } from '$lib/utils';
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
  import UserGraphic from './_UserGraphic.svelte';
  import { usersFoundation } from '$lib/stores';
  import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import { locale } from 'svelte-i18n';
  import type { Mail } from '$lib/types';
  import type { UserFoundation } from '$lib/classes/repos/types';

  export let mail: Mail;
  export let type: string | null;
  export { className as class };
  export let selected = false;
  export let selection: Mail | null | undefined;
  export let userId: string;

  type ParsedMail = {
    id: string;
    _from: FromTo[];
    _to: FromTo[];
    subject: string;
    _read: boolean;
    created: Date;
  };

  type FromTo = UserFoundation | string | { email: string };

  const dispatch = createEventDispatcher();

  let parsedMail: ParsedMail;
  let userItems: FromTo[];
  // let userItems: () => FromTo[];
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

  $: parsedMail = parseMail(mail, type);
  $: userItems = type === INBOX ? parsedMail._from : type === SENT ? parsedMail._to : [];
  $: userDisplayName = (user: any) => user.name || user.email;
  $: created = localeFormat(new Date(parsedMail.created || 1970), dateFormat);
  $: unread = mail?._read === false;
  $: browser && selected && focusHandler();

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
    $page.url.searchParams.set('mail_id', mail.id);
    return $page.url.href;
  }

  function parseMail(mail: Mail, type: string | null) {
    const { subject } = JSON.parse(mail.message);
    return {
      id: mail.id,
      _from: type === SENT ? [mail._from] : parseUsernames([mail._from]),
      _to: type === SENT ? parseUsernames(mail._to.split(';')) : [userId],
      subject: subject,
      _read: mail._read,
      created: mail.created
    };
  }

  const parseUsernames = (senders: string[]) => {
    let user;
    let items: (UserFoundation | { email: string })[] = [];
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
        <span class="subject">{parsedMail.subject || '--'}</span><span class="date-created"
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
