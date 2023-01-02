<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, setContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { infos, fabs, session, users, videos, usersFoundation } from '$lib/stores';
  import Layout from './layout.svelte';
  import {
    Component,
    InfoChips,
    Legal,
    MediaUploader,
    PageBar,
    Paginator,
    SimpleUserCard,
    SvgIcon,
    UserGraphic,
    VideoEditorList
  } from '$lib/components';
  import { log, proxyEvent } from '$lib/utils';
  import Button, { Icon as ButtonIcon } from '@smui/button';
  import Fab, { Label } from '@smui/fab';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import List from '@smui/list';
  import Dialog, { Title as DialogTitle, Content, Actions, InitialFocus } from '@smui/dialog';
  import { _ } from 'svelte-i18n';

  /**
   * @param {string} key
   * @param {string} val
   */
  async function searchUsersBy(key, val) {
    return await api
      .get(`users?${key}=${val}`, { token: $session.user?.jwt })
      .then((res) => res)
      .catch((reason) => log(reason));
  }

  setContext('searchUsers', {
    findUsersBy: searchUsersBy
  });

  const minSearchChars = 3;
  const { open: open$editor, close: close$editor } = getContext('editor-modal');
  const { open: open$default, close: close$default } = getContext('default-modal');
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const { getSegment } = getContext('segment');
  const { findUsersBy } = getContext('searchUsers');

  /**
   * @type {SvelteStore<string>}
   */
  const segment = getSegment();
  /**
   * @type {import('./$types').LayoutData}
   */
  export let data;

  /**
   * @type {import('$lib/types').User}
   */
  let currentUser;
  /**
   * @type {string}
   */
  let username;
  let tokenExpires;
  /**
   * @type {boolean}
   */
  let hasExpired;
  /**
   * @type {string}
   */
  let token;
  /**
   * @type {string | null}
   */
  let tokenId;
  /**
   * @type {string}
   */
  let magicLink;
  /**
   * @type {string}
   */
  let search = '';
  /**
   * @type {import('@smui/snackbar')}
   */
  let snackbar;
  /**
   * @type {string}
   */
  let message;
  /**
   * @type {Dialog}
   */
  let infoDialog;
  /**
   * @type {Dialog}
   */
  let generateTokenDialog;
  /**
   * @type {Dialog}
   */
  let activateUserDialog;
  /**
   * @type {Dialog}
   */
  let resolveAllDialog;
  /**
   * @type {Dialog}
   */
  let renewedTokenDialog;
  /**
   * @type {Dialog}
   */
  let removeTokenDialog;
  /**
   * @type {Dialog}
   */
  let redirectDialog;
  /**
   * @type {number}
   */
  let selectionIndex;
  /**
   * @type {any}
   */
  let uploadedData;
  /**
   * @type {any}
   */
  let listMethods;
  /**
   * @type {boolean}
   */
  let active;

  $: pagination = data.pagination?.users;
  $: selectionUserId = $page.params.slug || $session.user?.id;
  $: currentUser = ((id) => $users?.find((usr) => usr.id === id))(selectionUserId);
  $: ((usr) => {
    username = usr?.name;
    active = usr?.active || false;
    tokenId = usr?.token_id || null;
    token = usr?.jwt || '';
    tokenExpires = usr?.expires;
    hasExpired = (tokenExpires && tokenExpires * 1000 < +new Date().getTime()) || false;
    magicLink = token ? `${$page.url.origin}/login?token=${token}` : '';
  })(currentUser);
  $: (async (s) => {
    if (s.length >= minSearchChars) {
      const { success, data } = await findUsersBy('name', s);
      if (success) users.add(data);
    }
  })(search);
  $: filteredUsers =
    $users.filter((user) =>
      search.length >= minSearchChars
        ? user.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 &&
          user.id !== $session.user?.id
        : user.id !== $session.user?.id
    ) || [];
  $: filteredUsers.sortBy('name');
  $: userInfos = ($infos?.has(selectionUserId) && $infos.get(selectionUserId).params) || [];
  $: userIssues = userInfos.filter(
    /**
     *
     * @param {any} info
     */
    (info) => info.type === 'issue'
  );

  onMount(() => {
    snackbar = getSnackbar();

    if (selectionUserId) scrollSelectedIntoView();

    let renewed;
    if ((renewed = localStorage.getItem('renewed')) && renewed == $session.user?.id) {
      renewedTokenDialog?.setOpen(true);
    }

    window.addEventListener('info:open:resolve-all-dialog', resolveAllHandler);
    window.addEventListener('info:open:help-dialog', infoDialogHandler);
    // @ts-ignore
    window.addEventListener('info:user:activate', activateUserHandler);
    window.addEventListener('info:token:remove', removeTokenHandler);
    // @ts-ignore
    window.addEventListener('info:token:generate', generateTokenHandler);
    window.addEventListener('info:token:redirect', tokenRedirectHandler);

    return () => {
      window.removeEventListener('info:open:resolve-all-dialog', resolveAllHandler);
      window.removeEventListener('info:open:help-dialog', infoDialogHandler);
      // @ts-ignore
      window.removeEventListener('info:user:activate', activateUserHandler);
      window.removeEventListener('info:token:remove', removeTokenHandler);
      // @ts-ignore
      window.removeEventListener('info:token:generate', generateTokenHandler);
      window.removeEventListener('info:token:redirect', tokenRedirectHandler);
    };
  });

  // changes in users should cause usersFoundation to reload next time it is needed
  users.subscribe(() => usersFoundation.set(null));

  async function addUser() {
    proxyEvent('user:add');
  }

  /**
   *
   * @param {{constrained: any }} config
   */
  async function generateToken(config) {
    const { constrained } = { ...config };
    const res = await api.post('tokens', {
      data: { user_id: currentUser.id, constrained },
      token: $session.user?.jwt
    });

    let message;
    if (res?.success) {
      users.put({ ...res.data });
      message = res.message;
      configSnackbar(message);
      snackbar?.open();
      return res;
    } else {
      try {
        // validation message
        let message = res.data.errors.token._isUnique || res.data.massage || 'Error';
        configSnackbar(message);
      } catch (e) {}
      snackbar?.open();
    }
  }

  async function removeToken() {
    await api
      .del(`tokens/${tokenId}?locale=${$session.locale}`, { token: $session.user?.jwt })
      .then((res) => {
        if (res?.success) {
          users.put({ ...currentUser, ...res.data });
        }
        configSnackbar(res.message);
        snackbar?.open();
      });
  }

  async function activateUser(state = {}) {
    let data = 'active' in state ? state : { active: !active };
    await api
      .put(`users/${selectionUserId}?locale=${$session.locale}`, {
        data,
        token: $session.user?.jwt
      })
      .then((res) => {
        message = res.message || res.data.message || res.statusText;

        if (res?.success) {
          // @ts-ignore
          users.put({ ...currentUser, ...data });
        } else {
          active = !active;
        }
        configSnackbar(message);
        snackbar?.open();
      });
  }

  function resolveAll() {
    for (const info of userInfos) {
      proxyEvent(info.eventType, { silent: true });
    }
  }

  function resolveAllHandler() {
    resolveAllDialog?.setOpen(true);
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function activateUserHandler(event) {
    (event.detail.silent && activateUser({ active: true })) || activateUserDialog?.setOpen(true);
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function generateTokenHandler(event) {
    (event.detail.silent && generateToken({ constrained: false })) ||
      generateTokenDialog?.setOpen(true);
  }

  function removeTokenHandler() {
    removeTokenDialog?.setOpen(true);
  }

  function tokenRedirectHandler() {
    redirectDialog?.setOpen(true);
  }

  function infoDialogHandler() {
    infoDialog?.setOpen(true);
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function resolveAllDialogCloseHandler(event) {
    if (event.detail.action === 'approved') {
      resolveAll();
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function activateUserDialogCloseHandler(event) {
    if (event.detail.action === 'approved') {
      activateUser({ active: true });
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function generateTokenDialogCloseHandler(event) {
    if (event.detail.action === 'approved') {
      generateToken({ constrained: false });
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function removeTokenDialogCloseHandler(event) {
    if (event.detail.action === 'approved') {
      removeToken();
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function renewTokenDialogCloseHandler(event) {
    if (event.detail.action === 'approved') {
      localStorage.removeItem('renewed');
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function tokenRedirectDialogCloseHandler(event) {
    if (
      'redirect' === event.detail.action &&
      /^(https?|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-&]+\.?)+(\/[^\s]*)?$/i.test(magicLink)
    ) {
      goto(`/login?token=${token}`);
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function chipInteractionHandler({ detail }) {
    console.log(detail);
  }

  /**
   *
   * @param {any} type
   */
  let openUploader = (type) => {
    open$default(
      MediaUploader,
      {
        layoutProps: { type: $_('text.videos') },
        type: 'video',
        options: {
          // acceptedFiles: '.mov .mp4 .m4a .m4v .3gp .3g2 .webm',
          parallelUploads: 1,
          maxFiles: 1,
          timeout: 3600 * 1000, // 60min
          maxFilesize: 1024 // Megabyte
        },
        events: { 'upload:success': uploadSuccessHandler }
      },
      {
        closeOnOuterClick: false,
        transitionWindow: fly,
        transitionWindowProps: {
          y: -200,
          duration: 500
        }
      },
      { onClosed: openEditor }
    );
  };

  /**
   *
   * @param {CustomEvent} param0
   */
  function uploadSuccessHandler({ detail }) {
    /**
     * @type {any}
     */
    const { data, message, success } = { ...detail.responseText };

    configSnackbar(message);
    snackbar?.open();

    if (success) {
      uploadedData = data;
      videos.add([data]);
      close$default();
    }
  }

  function openEditor() {
    if (!uploadedData) return;

    open$editor(
      VideoEditorList,
      {
        data: uploadedData
      },
      {
        closeOnOuterClick: false
      }
    );
    uploadedData = null;
  }

  /**
   * @param {CustomEvent} event
   */
  function receiveListMethods({ detail }) {
    listMethods = detail;
  }

  function scrollSelectedIntoView() {
    const { items } = listMethods;
    setTimeout(() => {
      const item = items.find((/** @type {{ selected: any; }} */ item) => item.selected);
      item?.element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 100);
  }
</script>

<Layout sidebar segment={$segment}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div class="sidebar flex-1" slot="side">
    <Component transparent headerHeight="76px">
      <div slot="header">
        <Textfield class="search-user" bind:value={search} label={$_('text.search-user')}>
          <Icon
            role="button"
            style="font-size: 1em;"
            class="material-icons-outlined cancel-search"
            slot="trailingIcon"
            on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
          >
          <span class="info-label"
            >{$_('text.type-min-char-count', { values: { count: minSearchChars } })}</span
          >
        </Textfield>
      </div>
      <List
        class="mb-10 users-list"
        twoLine
        avatarList
        singleSelection
        bind:selectedIndex={selectionIndex}
        on:SMUIList:mount={receiveListMethods}
      >
        <SimpleUserCard
          id={$session.user?.id}
          {selectionUserId}
          user={$users.find((user) => user.id === $session.user?.id)}
          ><div class="my-badge">
            <Icon class="material-icons">contact_page</Icon>
          </div>
        </SimpleUserCard>
        {#if filteredUsers.length}
          {#each filteredUsers as user (user.id)}
            <SimpleUserCard id={user.id} class="flex" {selectionUserId} {user} />
          {/each}
          <Paginator {pagination} store={users} id="users-paginator" action="/users?/more" />
        {/if}
      </List>
    </Component>
  </div>
  <div slot="ad">
    <div class="m-auto ml-0"><Legal /></div>
  </div>
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0">
      <InfoChips staggered {selectionUserId} />
    </div>
    <div class="m-auto mr-0" />
  </div>
</Layout>
<Dialog bind:this={infoDialog} aria-labelledby="info-title" aria-describedby="info-content">
  <DialogTitle id="info-title">{$_('text.what-is-a-token')}</DialogTitle>
  <Content id="info-content">
    <div class="item">{$_('text.a-token-is')}</div>
    <div class="item">
      <details>
        <summary>{$_('text.what-is-the-token-good-for')}</summary>
        <p>
          {$_('messages.what-is-the-token-used-for')}
        </p>
      </details>
      <details>
        <summary>{$_('text.how-do-i-proceed')}</summary>
        {@html $_('messages.usage-of-the-button', {
          values: { button: $_('text.generate-token') }
        })}
      </details>
      <details>
        <summary>{$_('messages.misusage')}</summary>
        <p>
          {@html $_('messages.generate-a-new-token', {
            values: { button: $_('text.generate-token') }
          })}
        </p>
        <p>
          {@html $_('messages.use-remove-token-button', {
            values: { button: $_('text.remove-token') }
          })}
        </p>
      </details>
    </div>
    <div class="item">
      <h4>{$_('text.transfer-to-third-parties')}</h4>
      <ButtonIcon class="material-icons leading">warning</ButtonIcon>
      <p>
        {$_('messages.every-token-owner')}
      </p>
    </div>
    <div class="item">
      <h4>{$_('text.validity')}</h4>
      <p>
        {$_('messages.validity-of-the-token')}
      </p>
    </div>
  </Content>
  <Actions>
    <Button action="approved" default use={[InitialFocus]}>
      <Label>{$_('text.close')}</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={resolveAllDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={resolveAllDialogCloseHandler}
>
  {#if userIssues.length}
    <DialogTitle id="info-title">{$_('text.content-inaccessible')}</DialogTitle>
    <Content id="info-content">
      <div class="item">
        {@html $_('messages.content-inaccessible', {
          values: { name: username }
        })}
      </div>
      <div class="list">
        <ul class="reasons-list">
          {#each userIssues as issue}
            <li>{$_(issue.label)}</li>
          {/each}
        </ul>
      </div>
    </Content>
    <Actions>
      <Button action="none">
        <Label>{$_('text.cancel')}</Label>
      </Button>
      <Button action="approved" variant="unelevated" default use={[InitialFocus]}>
        <Label>{$_('text.resolve-conflicts')}</Label>
      </Button>
    </Actions>
  {:else}
    <Content id="info-content">
      <div class="item">
        {$_('text.issues-fixed')}
      </div>
    </Content>
    <Actions>
      <Button action="none" variant="unelevated" default use={[InitialFocus]}>
        <Label>{$_('text.close')}</Label>
      </Button>
    </Actions>
  {/if}
</Dialog>
<Dialog
  bind:this={activateUserDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={activateUserDialogCloseHandler}
>
  <DialogTitle id="info-title">{$_('text.activate-user')}</DialogTitle>
  <Content id="info-content">
    <div class="item">
      {@html $_('messages.should-user-be-activated', {
        values: { name: username }
      })}
    </div>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="approved" variant="unelevated" default use={[InitialFocus]}>
      <Label>{active ? $_('text.deactivate-user') : $_('text.activate-user')}</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={generateTokenDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={generateTokenDialogCloseHandler}
>
  <DialogTitle id="info-title">{$_('text.generate-token')}</DialogTitle>
  <Content id="info-content">
    <div class="item">
      {#if token && !hasExpired}
        <ButtonIcon class="material-icons leading">warning</ButtonIcon>
        <p>{$_('messages.previous-token-will-be-discarted')}</p>
      {/if}
      <p>
        {@html $_('messages.transfer-token-reminder', {
          values: { name: username }
        })}
      </p>
    </div>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="approved" variant="unelevated" default use={[InitialFocus]}>
      <Label>{$_('text.generate-token')}</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={removeTokenDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={removeTokenDialogCloseHandler}
>
  <DialogTitle id="info-title">{$_('text.delete-token')}</DialogTitle>
  <Content id="info-content">
    <ButtonIcon class="material-icons leading">warning</ButtonIcon>
    <div class="item">{$_('messages.deactivating-token-locks-account')}</div>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button action="approved" variant="unelevated" default use={[InitialFocus]}>
      <Label>{$_('text.delete-token-and-deactivate-account')}</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={redirectDialog}
  aria-labelledby="event-title"
  aria-describedby="event-content"
  on:SMUIDialog:closed={tokenRedirectDialogCloseHandler}
  class="redirect-dialog"
>
  <DialogTitle id="event-title">{$_('text.change-account')}</DialogTitle>
  <Content id="event-content">
    {#if userIssues.length}
      <p>
        {@html $_('messages.login-will-fail', { values: { name: username } })}
      </p>
      <div class="flex mt-3 mb-3">
        {#each userIssues as issue}
          <span class="self-center mr-2"><strong>{$_(issue.reason)}:</strong></span>
          <span>
            <Button
              variant="raised"
              on:click={() => {
                console.log(issue);
                proxyEvent(issue.eventType, { silent: true });
              }}
            >
              <Label>{$_(issue.label)}</Label>
            </Button>
          </span>
        {/each}
      </div>
      <p>
        <a href={magicLink}>{@html $_('text.continue-anyways', { values: { name: username } })}</a>
      </p>
    {:else}
      <p>{@html $_('messages.you-will-be-logged-out', { values: { name: username } })}</p>
    {/if}
    <div class="absolute" style="z-index: 1; top: -11px; right: 3px;">
      <UserGraphic
        size="40"
        borderSize="2"
        borderColor="--primary"
        extendedBorderSize="5"
        extendedBorderColor="--surface"
        dense
        user={currentUser}
        inactive={!!userIssues.length}
        badge={{
          icon: 'swap_horiz',
          position: 'BOTTOM_LEFT',
          size: 'small'
        }}
      />
    </div>
    <div class="absolute" style="z-index: 0; top: -7px; right: 37px;">
      <UserGraphic
        size="35"
        borderSize="2"
        borderColor="--primary"
        extendedBorderSize="6"
        dense
        extendedBorderColor="--surface"
        user={$session.user}
      />
    </div>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.cancel')}</Label>
    </Button>
    <Button
      disabled={userIssues.length}
      variant="unelevated"
      action="redirect"
      use={[InitialFocus]}
    >
      <Label class="token-button-label">{$_('text.switch-user')}</Label>
    </Button>
  </Actions>
</Dialog>
<Dialog
  bind:this={renewedTokenDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={renewTokenDialogCloseHandler}
>
  <DialogTitle id="info-title">{$_('text.token-updated')}</DialogTitle>
  <Content id="info-content">
    <div class="item">
      <p>{$_('text.token-was-renewed')}</p>
    </div>
  </Content>
  <Actions>
    <Button action="none">
      <Label>{$_('text.close')}</Label>
    </Button>
    <Button action="approved" variant="unelevated" default use={[InitialFocus]}>
      <Label>{$_('text.got-it')}</Label>
    </Button>
  </Actions>
</Dialog>
{#if $fabs === 'add-user'}
  <div class="fab">
    <Fab class="floating-fab" color="primary" on:click={addUser} extended>
      <Label>{$_('text.new-user')}</Label>
      <ButtonIcon class="material-icons">person_add</ButtonIcon>
    </Fab>
  </div>
{:else if $fabs === 'add-video'}
  <div class="fab">
    <Fab class="floating-fab" color="primary" on:click={() => openUploader('video')} extended>
      <Label>{$_('text.add-video')}</Label>
      <Icon class="material-icons">add</Icon>
    </Fab>
  </div>
{/if}

<style>
  .fab {
    position: absolute;
    z-index: 999;
  }
  :global(.datapicker--open) .fab,
  :global(.add-user-view--open) .fab {
    display: none;
  }
  :global(.grid:not(.sidebar) .grid-item.side) {
    display: none;
  }
  h4 {
    margin: revert;
  }
  :global(.cancel-search) {
    cursor: pointer;
  }
  .reasons-list {
    list-style: disc;
    margin: 1em 0;
  }
  .reasons-list li {
    margin-left: 1em;
    font-weight: 600;
  }
  :global(.redirect-dialog .mdc-dialog__surface) {
    overflow-y: visible;
  }
  :global(.users-list) {
    margin-top: -5px;
    padding-top: 5px;
  }
  :global(.users-list > li:first-child) {
    position: absolute;
    z-index: 1;
    width: 100%;
    border-bottom: 1px solid var(--primary);
    background-color: var(--background);
  }
  :global(.users-list > li:nth-child(2)) {
    margin-top: 72px;
  }
  .my-badge {
    position: absolute;
    width: 74px;
    height: 15px;
    right: 12px;
    bottom: 22px;
    display: inline-flex;
    transform: translate(40px, 20px) rotate(-40deg);
  }
  .my-badge::before {
    content: '';
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-color: var(--primary);
  }
  .my-badge :global(.material-icons) {
    position: relative;
    font-size: 0.7em;
    z-index: 1;
    vertical-align: middle;
    margin: 0 auto;
    color: white;
  }
</style>
