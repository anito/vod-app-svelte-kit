<script lang="ts">
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, setContext } from 'svelte';
  import { UserManager, TimeManager, MailManager, UserGraphic } from '$lib/components';
  import Button, { Group, Label, Icon } from '@smui/button';
  import { users, usersFoundation, session } from '$lib/stores';
  import {
    emit,
    INBOX,
    ADMIN,
    SUPERUSER,
    TABS,
    createTabSearch,
    EDIT,
    ADD,
    DEFAULT_TAB,
    buildSearchParams
  } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import type { User } from '$lib/classes/repos/types';

  export let data;

  let selectedMode = EDIT;
  let userExpires;
  let hasExpired;
  let jwt;
  let magicLink: string = '';
  let selectedUser: User | undefined;
  let username: string;

  $: if (data.user) users.add([data.user]);
  $: selectionUserId = $page.params.slug;
  $: selectedUser = ((id) =>
    $users.find((usr) => usr.id === id) || (!!$users.length && $users[0]) || undefined)(
    selectionUserId
  );
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: isCurrentSuperUser = selectedUser?.role === SUPERUSER;
  $: username = selectedUser?.name || '';
  $: tab = ((tab) => TABS.find((itm) => itm === tab))($page.url.searchParams.get('tab'));
  $: ((user) => {
    if (!user || isCurrentSuperUser) {
      userExpires = null;
      hasExpired = true;
      jwt = '';
      magicLink = '';
    } else {
      userExpires = user.expires;
      hasExpired = (!isNaN(userExpires) && userExpires * 1000 < +new Date().getTime()) || false;
      jwt = user.jwt;
      magicLink = jwt && `${$page.url.origin}/login?token=${jwt}`;
    }
  })(selectedUser);
  $: disabled = !magicLink || !hasPrivileges || isCurrentSuperUser ? true : false;
  $: hidden = selectionUserId == $session.user?.id ? true : false;

  setContext('siux', {
    getSIUX: getSimpleUserIndex
  });

  onMount(() => {
    window.addEventListener('user:add', addUserHandler);
    if (!tab) {
      const hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
      const tab = hasPrivileges
        ? $page.data.config.Site.defaultadmintab
        : $page.data.config.Site.defaultusertab;
      const search = createTabSearch(tab || DEFAULT_TAB);
      setTimeout(() => goto($page.url.pathname + search), 200);
    }
    return () => {
      window.removeEventListener('user:add', addUserHandler);
    };
  });

  async function addUserHandler() {
    const searchParams = new URLSearchParams({ tab: 'profile', mode: 'add' });
    await goto(`${$page.url.pathname}?${searchParams.toString()}`);
  }

  async function getSimpleUserIndex() {
    if ($usersFoundation !== null) return Promise.resolve($usersFoundation);
    return await api
      .get('users/simpleindex', { token: $session.user?.jwt })
      .then((res) => {
        return res;
      })
      .catch((reason) => console.log(reason));
  }
</script>

<svelte:head>
  <title>{$page.data.config.Site?.name} | {$_('text.user')} {username}</title>
</svelte:head>

<div class="flex flex-1 user-grid inner-grid {tab}">
  <div class="grid-item toolbar justify-between">
    <Group variant="unelevated">
      <Button
        class="focus:outline-none focus:shadow-outline"
        href="/users/{selectionUserId}?tab=time"
        variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
      >
        <Icon class="material-icons">ondemand_video</Icon>
        <Label>{$_('text.videos')}</Label>
      </Button>
      <Button
        class="focus:outline-none focus:shadow-outline"
        href="/users/{selectionUserId}?tab=profile"
        variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
      >
        <Icon class="material-icons">account_circle</Icon>
        <Label>{$_('text.user-profil')}</Label>
      </Button>
      <Button
        class="focus:outline-none focus:shadow-outline"
        href="/users/{selectionUserId}?tab=mail&active={INBOX}"
        variant={tab === TABS[2] ? 'unelevated' : 'outlined'}
      >
        <Icon class="material-icons">mail</Icon>
        <Label>{$_('text.mail')}</Label>
      </Button>
    </Group>
    <div class="flex mr-2" class:hidden>
      <Button
        on:click={async () =>
          await goto(
            `${$page.url.pathname}${buildSearchParams($page.url.searchParams, {
              append: [['dialog', 'token-redirect']]
            })}`
          )}
        {disabled}
        variant="unelevated"
      >
        <UserGraphic
          borderSize={1}
          borderColor="--surface"
          size={18}
          dense
          style="margin-right: 10px;"
          user={selectedUser}
        />
        <Label>{$_('text.switch-account')}</Label>
      </Button>
    </div>
  </div>
  {#if tab === TABS[0]}
    <TimeManager {selectionUserId} />
  {/if}
  {#if tab === TABS[1]}
    <UserManager
      on:user:Redirect
      on:token:Generate
      on:token:Remove
      on:user:Activate
      on:open:InfoDialog
      {selectionUserId}
    />
  {/if}
  {#if tab === TABS[2]}
    <MailManager {selectionUserId} />
  {/if}
</div>

<style>
  .user-grid {
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap-sm);
    align-items: center;
    grid-template-areas:
      'toolbar toolbar'
      'main main';
    grid-template-columns: 4fr 4fr;
    align-items: initial;
  }
  :global(.user).user-grid {
    grid-template-areas:
      'toolbar toolbar'
      'main main';
    grid-template-columns: 1fr 1fr;
  }
  :global(.time).user-grid {
    grid-template-areas:
      'toolbar toolbar'
      'main main';
    grid-template-columns: 4fr 4fr;
    align-items: initial;
  }
  :global(.mail).user-grid {
    grid-template-areas:
      'toolbar toolbar'
      'main main';
    grid-template-columns: 4fr 4fr;
    align-items: initial;
  }
  :global(.loggedin) .user-grid {
    align-items: initial;
  }
  .grid-item {
    background: var(--background-intense);
    padding-left: 0.4rem;
  }
  .toolbar {
    grid-area: toolbar;
    display: flex;
    align-items: center;
    height: var(--toolbar-h);
  }
</style>
