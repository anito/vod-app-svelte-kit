<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, setContext } from 'svelte';
  import { UserManager, TimeManager, MailManager, UserGraphic } from '$lib/components';
  import Button, { Group, Label, Icon } from '@smui/button';
  import { users, slim, sitename, session } from '$lib/stores';
  import { proxyEvent, INBOX, ADMIN, SUPERUSER, TABS, log } from '$lib/utils';
  import { _ } from 'svelte-i18n';
  import { browser } from '$app/environment';

  /**  * @type {string} */
  let selectedMode = 'edit';

  /** * @type {any} */
  let userExpires;

  /** @type {boolean} */
  let hasExpired;

  /**  * @type {string} */
  let jwt;

  /** @type {string} */
  let magicLink;

  /** @type {import('$lib/types').User} */
  let currentUser;

  /** @type {any} */
  let username;

  $: selectionUserId = $page.params.slug;
  $: currentUser = ((id) => $users.find((usr) => usr.id === id) || ($users.length && $users[0]))(
    selectionUserId
  );
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: isCurrentSuperUser = currentUser?.role === SUPERUSER;
  $: username = currentUser?.name || '';
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
  })(currentUser);
  $: hidden =
    !hasPrivileges || isCurrentSuperUser
      ? true
      : selectionUserId == $session.user?.id
      ? true
      : false;

  setContext('siux', {
    getSIUX: getSimpleUserIndex
  });

  onMount(() => {
    window.addEventListener('USER:add', addUserHandler);

    return () => {
      window.removeEventListener('USER:add', addUserHandler);
    };
  });

  /** @param {any} e */
  async function addUserHandler(e) {
    const searchParams = new URLSearchParams($page.url.searchParams.toString());
    if (!searchParams.has('mode')) {
      searchParams.append('mode', 'add');
    } else {
      searchParams.set('mode', 'add');
    }
    await goto(`${$page.url.pathname}?${searchParams.toString()}`);
  }

  async function getSimpleUserIndex() {
    if ($slim) return Promise.resolve($slim);
    return await api
      .get('users/simpleindex', { token: $session.user?.jwt, fetch })
      .then((res) => {
        return res;
      })
      .catch((reason) => log(reason));
  }
</script>

<svelte:head>
  <title>{$sitename} | {$_('text.user')} {username}</title>
</svelte:head>

<div class="flex flex-1 user-grid inner-grid {tab}">
  <div class="grid-item toolbar justify-between">
    <Group variant="unelevated">
      <Button
        data-sveltekit-prefetch=""
        class="focus:outline-none focus:shadow-outline"
        href="/users/{selectionUserId}?tab=time"
        variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
      >
        <Icon class="material-icons">video_settings</Icon>
        <Label>{$_('text.videos')}</Label>
      </Button>
      <Button
        data-sveltekit-prefetch=""
        class="focus:outline-none focus:shadow-outline"
        href="/users/{selectionUserId}?tab=profile"
        variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
      >
        <Icon class="material-icons">account_circle</Icon>
        <Label>{$_('text.user-profil')}</Label>
      </Button>
      <Button
        data-sveltekit-prefetch=""
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
        on:click={() => proxyEvent('INFO:token:Redirect')}
        disabled={!magicLink}
        variant="unelevated"
        user
      >
        <UserGraphic
          borderSize="2"
          borderColor="--surface"
          size="18"
          dense
          style="margin-right: 10px;"
          user={currentUser}
        />
        <Label>{$_('text.change-account')}</Label>
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
      {selectedMode}
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
    grid-gap: var(--grid-gap);
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
    background: var(--back-grid-item);
    padding-left: 0.4rem;
  }
  .toolbar {
    grid-area: toolbar;
    display: flex;
    align-items: center;
    height: var(--toolbar-h);
  }
</style>
