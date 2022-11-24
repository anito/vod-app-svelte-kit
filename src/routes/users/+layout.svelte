<script>
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import {
    infos,
    fabs,
    session,
    users,
    videos,
    images,
    usersFoundation,
    videosAll
  } from '$lib/stores';
  import Layout from './layout.svelte';
  import {
    InfoChips,
    Legal,
    SimpleUserCard,
    PageBar,
    MediaUploader,
    Component,
    SvgIcon,
    VideoEditorList,
    UserGraphic
  } from '$lib/components';
  import { proxyEvent } from '$lib/utils';
  import Button, { Icon as Icon_ } from '@smui/button';
  import Fab, { Label } from '@smui/fab';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import List from '@smui/list';
  import Dialog, { Title as DialogTitle, Content, Actions, InitialFocus } from '@smui/dialog';
  import { _, locale } from 'svelte-i18n';

  const { open: open$editor, close: close$editor } = getContext('editor-modal');
  const { open: open$default, close: close$default } = getContext('default-modal');
  const { getSnackbar, configSnackbar } = getContext('snackbar');
  const { getSegment } = getContext('segment');
  /** @type {SvelteStore<string>} */
  const segment = getSegment();

  /** @type {import('$lib/types').User} */
  let currentUser;
  /** @type {string} */
  let username;
  let tokenExpires;
  /** @type {boolean} */
  let hasExpired;
  /** @type {string} */
  let token;
  /** @type {string | null} */
  let tokenId;
  /** @type {string} */
  let magicLink;
  /** @type {string} */
  let search = '';
  /** @type {import("@smui/snackbar").SnackbarComponentDev} */
  let snackbar;
  /** @type {string} */
  let message;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let infoDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let generateTokenDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let activateUserDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let resolveAllDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let renewedTokenDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let removeTokenDialog;
  /** @type {import("@smui/dialog").DialogComponentDev} */
  let redirectDialog;
  /** @type {number} */
  let selectionIndex;
  /** @type {any} */
  let uploadedData;
  /** @type {any} */
  let focusItemAtIndex;
  /** @type {import("@smui/list").ItemComponentDev}[] */
  let listItems;
  /** @type {boolean} */
  let active;

  $: selectionUserId = $page.params.slug || $session.user?.id;
  $: selectionUserId && listItems && scrollIntoView();
  $: currentUser = ((id) => $users.find((usr) => usr.id === id))(selectionUserId);
  $: user = $users.find((user) => $session.user?.id === user.id);
  $: ((usr) => {
    username = usr?.name;
    active = usr?.active || false;
    tokenId = usr?.token_id || null;
    token = usr?.jwt || '';
    tokenExpires = usr?.expires;
    hasExpired = (tokenExpires && tokenExpires * 1000 < +new Date().getTime()) || false;
    magicLink = token ? `${$page.url.origin}/login?token=${token}` : '';
  })(currentUser);
  $: filteredUsers =
    $users.filter((user) => user.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) || [];
  $: userInfos = ($infos?.has(selectionUserId) && $infos.get(selectionUserId).params) || [];
  $: userIssues = userInfos.filter(
    /**
     *
     * @param {any} info
     */
    (info) => info.type === 'issue'
  );
  $: searchParams = $page && getSearchParams();
  $: query = searchParams && `?${searchParams}`;

  onMount(() => {
    snackbar = getSnackbar();

    let renewed;
    if ((renewed = localStorage.getItem('renewed')) && renewed == $session.user?.id) {
      renewedTokenDialog.setOpen(true);
    }

    // window.addEventListener('MDCChip:interaction', chipInteractionHandler);
    window.addEventListener('INFO:open:ResolveAllDialog', resolveAllHandler);
    window.addEventListener('INFO:open:InfoDialog', infoDialogHandler);
    // @ts-ignore
    window.addEventListener('INFO:user:Activate', activateUserHandler);
    window.addEventListener('INFO:token:Remove', removeTokenHandler);
    // @ts-ignore
    window.addEventListener('INFO:token:Generate', generateTokenHandler);
    window.addEventListener('INFO:token:Redirect', tokenRedirectHandler);

    return () => {
      // window.removeEventListener('MDCChip:interaction', chipInteractionHandler);
      window.removeEventListener('INFO:open:ResolveAllDialog', resolveAllHandler);
      window.removeEventListener('INFO:open:InfoDialog', infoDialogHandler);
      // @ts-ignore
      window.removeEventListener('INFO:user:Activate', activateUserHandler);
      window.removeEventListener('INFO:token:Remove', removeTokenHandler);
      // @ts-ignore
      window.removeEventListener('INFO:token:Generate', generateTokenHandler);
      window.removeEventListener('INFO:token:Redirect', tokenRedirectHandler);
    };
  });

  // changes in users should cause usersFoundation to reload next time it is needed
  users.subscribe(() => usersFoundation.set(null));

  async function addUser() {
    proxyEvent('USER:add');
  }

  /**
   *
   * @param {{constrained: any }} config
   */
  async function generateToken(config) {
    const { constrained } = { ...config };
    const res = await api.post(`tokens?locale=${$locale}`, {
      data: { user_id: currentUser.id, constrained },
      token: $session.user?.jwt
    });

    let message;
    if (res?.success) {
      users.put({ ...res.data });
      message = res.message;
      configSnackbar(message);
      snackbar.open();
      return res;
    } else {
      try {
        // validation message
        let message = res.data.errors.token._isUnique || res.data.massage || 'Error';
        configSnackbar(message);
      } catch (e) {}
      snackbar.open();
    }
  }

  async function removeToken() {
    await api.del(`tokens/${tokenId}`, { token: $session.user?.jwt }).then((res) => {
      if (res?.success) {
        users.put({ ...currentUser, ...res.data });
      }
      configSnackbar(res.message);
      snackbar.open();
    });
  }

  async function activateUser(state = {}) {
    let data = 'active' in state ? state : { active: !active };
    await api.put(`users/${selectionUserId}`, { data, token: $session.user?.jwt }).then((res) => {
      message = res.message || res.data.message || res.statusText;

      if (res?.success) {
        users.put({ ...currentUser, ...data });
      } else {
        active = !active;
      }
      configSnackbar(message);
      snackbar.open();
    });
  }

  function resolveAll() {
    for (const info of userInfos) {
      proxyEvent(info.eventType, { silent: true });
    }
  }

  function resolveAllHandler() {
    resolveAllDialog.setOpen(true);
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function activateUserHandler(event) {
    (event.detail.silent && activateUser({ active: true })) || activateUserDialog.setOpen(true);
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function generateTokenHandler(event) {
    (event.detail.silent && generateToken({ constrained: false })) ||
      generateTokenDialog.setOpen(true);
  }

  function removeTokenHandler() {
    removeTokenDialog.setOpen(true);
  }

  function tokenRedirectHandler() {
    redirectDialog.setOpen(true);
  }

  function infoDialogHandler() {
    infoDialog.setOpen(true);
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
  function chipInteractionHandler(event) {}

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
          uploadMultiple: true,
          parallelUploads: 2,
          maxFiles: 2,
          timeout: 3600 * 1000, // 60min
          maxFilesize: 1024 // Megabyte
        },
        events: { 'upload:successmultiple': uploadSuccessHandler }
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
    /** @type {any} */
    const { data, message, success } = { ...detail.responseText };

    configSnackbar(message);
    snackbar.open();

    if (success) {
      uploadedData = data;
      videos.add(data);
      close$default();
    }
  }

  function openEditor() {
    if (!uploadedData) return;

    open$editor(
      VideoEditorList,
      {
        data: uploadedData,
        user
      },
      {
        closeOnOuterClick: false
      }
    );
    uploadedData = null;
  }

  function getSearchParams() {
    /**
     * @type {any[]}
     */
    const omit = ['mail_id'];
    const searchParamsString = $page.url.searchParams.toString();
    const searchParams = new URLSearchParams(searchParamsString);
    omit.forEach((key) => {
      searchParams.has(key) && searchParams.delete(key);
    });
    return searchParams.toString();
  }

  /**
   *
   * @param {any} param0
   */
  function receiveListMethods({ detail }) {
    // @ts-ignore
    ({ focusItemAtIndex, items: listItems } = { ...detail });
  }

  /**
   *
   * @param {any} param0
   */
  function itemSelectedHandler({ detail }) {
    const { target } = detail;
    // target.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollIntoView() {
    const options = { block: 'nearest', behavior: 'smooth' };
    setTimeout(() => {
      const item = listItems.find(
        /** @param {import("@smui/list").ItemComponentDev} item */ (item) => item.selected
      );
      item?.element.scrollIntoView(options);
    }, 100);
  }
</script>

<Layout sidebar segment={$segment}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div class="sidebar flex-1" slot="side">
    <Component transparent>
      <div slot="header">
        <Textfield
          class="search"
          style="width: 100%;"
          variant="filled"
          bind:value={search}
          label={$_('text.search-user')}
          input$aria-controls="helper-text"
          input$aria-describedby="helper-text"
        >
          <Icon
            role="button"
            class="material-icons-outlined cancel-search"
            slot="trailingIcon"
            on:click={() => (search = '')}>{search.length && 'cancel'}</Icon
          >
        </Textfield>
      </div>
      {#if filteredUsers.length}
        <List
          class="mb-24"
          twoLine
          avatarList
          singleSelection
          bind:selectedIndex={selectionIndex}
          on:SMUIList:mount={receiveListMethods}
        >
          {#each filteredUsers as user (user.id)}
            <SimpleUserCard
              id={user.id}
              class="flex"
              on:itemSelected={itemSelectedHandler}
              {selectionUserId}
              {user}
              {query}
            />
          {/each}
        </List>
      {:else}
        <div class="loader flex justify-center">
          <SvgIcon name="animated-loader-3" size={50} fillColor="var(--primary)" class="mr-2" />
        </div>
      {/if}
    </Component>
  </div>
  <div slot="ad">
    <div class="m-auto ml-0"><Legal /></div>
  </div>
  <div slot="footer" class="flex justify-between">
    <div class="m-auto ml-0"><InfoChips staggered {selectionUserId} /></div>
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
      <Icon_ class="material-icons leading">warning</Icon_>
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
        <Icon_ class="material-icons leading">warning</Icon_>
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
    <Icon_ class="material-icons leading">warning</Icon_>
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
            <Button variant="raised" on:click={() => proxyEvent(issue.eventType, { silent: true })}>
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
    <div class="absolute" style="z-index: 1; top: -11px; right: -6px;">
      <UserGraphic
        size="40"
        borderSize="2"
        borderColor="--primary"
        extendedBorderSize="6"
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
    <div class="absolute" style="z-index: 0; top: -7px; right: 23px;">
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
      <Icon_ class="material-icons">person_add</Icon_>
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
</style>
