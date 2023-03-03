<script lang="ts">
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, getContext, setContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { fabs, infos, session, users, usersFoundation } from '$lib/stores';
  import Layout from './layout.svelte';
  import {
    Container,
    InfoChips,
    Legal,
    MediaUploader,
    PageBar,
    Paginator,
    SearchTextField,
    SimpleUserCard,
    SvgIcon,
    UserGraphic,
    VideoEditorList
  } from '$lib/components';
  import { emit, filterByModelKeys, USER } from '$lib/utils';
  import Button, { Icon as ButtonIcon } from '@smui/button';
  import Fab, { Label } from '@smui/fab';
  import Icon from '@smui/textfield/icon';
  import List from '@smui/list';
  import Dialog, { Title as DialogTitle, Content, Actions, InitialFocus } from '@smui/dialog';
  import { _ } from 'svelte-i18n';
  import type { LayoutData } from './$types';
  import type { User } from '$lib/classes/repos/types';
  import type { Issue } from '$lib/types';
  import type Snackbar from '@smui/snackbar';
  import type Dropzone from '$lib/components/Dropzone/index.svelte';

  const minSearchChars = 2;
  const { getDropzone }: any = getContext('dropzone');
  const { open: open$editor }: any = getContext('editor-modal');
  const { open: open$default, close: close$default }: any = getContext('default-modal');
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');
  const { getSegment }: any = getContext('segment');
  const { searchUsers }: any = getContext('search');
  const modelSearchKeys = 'name,id';

  const segment = getSegment();
  export let data: LayoutData;

  let selectedUser: User | undefined;
  let username: string | undefined;
  let tokenExpires;
  let hasExpired: boolean;
  let token: string;
  let tokenId: string | null;
  let magicLink: string;
  let search = '';
  let snackbar: Snackbar;
  let message;
  let infoDialog: Dialog;
  let generateTokenDialog: Dialog;
  let activateUserDialog: Dialog;
  let resolveAllDialog: Dialog;
  let renewedTokenDialog: Dialog;
  let removeTokenDialog: Dialog;
  let redirectDialog: Dialog;
  let selectionIndex: number;
  let uploadedData: any;
  let listMethods: any;
  let active: boolean;

  $: pagination = data.pagination?.users;
  $: selectionUserId = $page.params.slug || $session.user?.id;
  $: selectedUser = ((id) => $users?.find((usr) => usr.id === id))(selectionUserId);
  $: ((user) => {
    username = user?.name;
    active = user?.active || false;
    tokenId = user?.token_id || null;
    token = user?.jwt || '';
    tokenExpires = user?.expires;
    hasExpired = (tokenExpires && tokenExpires * 1000 < +new Date().getTime()) || false;
    magicLink = token ? `${$page.url.origin}/login?token=${token}` : '';
  })(selectedUser);
  $: isDeepSearch = search.length >= minSearchChars;
  $: if (isDeepSearch) {
    (async (s) => {
      const { success, data } = await searchUsers({ keys: 'name,id', search: s }, 10);
      if (success) users.add(data);
    })(search);
  }
  $: filteredUsers = ((users) => filterByModelKeys(search, users, modelSearchKeys))(
    $users?.filter((user) => user.id !== $session.user?.id)
  );
  $: filteredUsers.sortBy('name');
  $: _infos = $infos as Map<string, { issues: Issue[] }>;
  $: userInfos =
    ((id) => {
      if (id) return _infos.get(id)?.issues;
    })(selectionUserId) || [];
  $: userIssues = userInfos.filter((info: { type: string }) => info.type === 'issue');

  onMount(() => {
    snackbar = getSnackbar();

    if (selectionUserId) scrollSelectedIntoView();

    let renewed;
    if ((renewed = localStorage.getItem('renewed')) && renewed == $session.user?.id) {
      renewedTokenDialog?.setOpen(true);
    }

    window.addEventListener('info:open:resolve-all-dialog', resolveAllHandler);
    window.addEventListener('info:open:help-dialog', infoDialogHandler);
    window.addEventListener('info:user:activate', activateUserHandler);
    window.addEventListener('info:token:remove', removeTokenHandler);
    window.addEventListener('info:token:generate', generateTokenHandler);
    window.addEventListener('info:token:redirect', tokenRedirectHandler);

    return () => {
      window.removeEventListener('info:open:resolve-all-dialog', resolveAllHandler);
      window.removeEventListener('info:open:help-dialog', infoDialogHandler);
      window.removeEventListener('info:user:activate', activateUserHandler);
      window.removeEventListener('info:token:remove', removeTokenHandler);
      window.removeEventListener('info:token:generate', generateTokenHandler);
      window.removeEventListener('info:token:redirect', tokenRedirectHandler);
    };
  });

  // changes in users should cause usersFoundation to reload next time it is needed
  users.subscribe(() => usersFoundation.set(null));

  async function addUser() {
    emit('user:add');
  }

  async function generateToken(constrained?: boolean) {
    const res = await api.post(`tokens?locale=${$page.data.session.locale}`, {
      data: { user_id: selectedUser?.id, constrained },
      token: $session.user?.jwt
    });

    let message;
    if (res?.success) {
      users.put({ ...res.data });
      message = res.message;
    } else {
      try {
        // validation message
        message = res.data.message || 'Error';
      } catch (e) {}
    }
    configSnackbar(message);
    snackbar?.forceOpen();
  }

  async function removeToken() {
    await api
      .del(`tokens/${tokenId}?locale=${$session.locale}`, { token: $session.user?.jwt })
      .then((res) => {
        if (res?.success) {
          users.put({ ...selectedUser, ...res.data });
        }
        configSnackbar(res.message);
        snackbar?.forceOpen();
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
          users.put({ ...selectedUser, ...data });
        } else {
          active = !active;
        }
        configSnackbar(message);
        snackbar?.forceOpen();
      });
  }

  function resolveAll() {
    for (const info of userInfos) {
      emit(info.eventType, { silent: true });
    }
  }

  function resolveAllHandler() {
    resolveAllDialog?.setOpen(true);
  }

  function activateUserHandler({ detail }: CustomEvent) {
    (detail.silent && activateUser({ active: true })) || activateUserDialog?.setOpen(true);
  }

  function generateTokenHandler({ detail }: CustomEvent) {
    (detail.silent && generateToken(false)) || generateTokenDialog?.setOpen(true);
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

  function resolveAllDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      resolveAll();
    }
  }

  function activateUserDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      activateUser({ active: true });
    }
  }

  function generateTokenDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      generateToken(false);
    }
  }

  function removeTokenDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      removeToken();
    }
  }

  function renewTokenDialogCloseHandler({ detail }: CustomEvent) {
    if (detail.action === 'approved') {
      localStorage.removeItem('renewed');
    }
  }

  function tokenRedirectDialogCloseHandler({ detail }: CustomEvent) {
    if (
      'redirect' === detail.action &&
      /^(https?|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-&]+\.?)+(\/[^\s]*)?$/i.test(magicLink)
    ) {
      goto(`/login?token=${token}`);
    }
  }

  function chipInteractionHandler({ detail }: CustomEvent) {
    console.log(detail);
  }

  let openUploader = () => {
    let dropzone: Dropzone;
    let completed = true;
    open$default(
      MediaUploader,
      {
        layoutProps: { type: $_('text.videos') },
        type: 'video',
        options: {
          // acceptedFiles: '.mov .mp4 .m4a .m4v .3gp .3g2 .webm',
          uploadMultiple: true,
          parallelUploads: 1,
          maxFiles: 1,
          timeout: 3600 * 1000, // 60min
          maxFilesize: 1024 // Megabyte
        },
        events: {
          'upload:successmultiple': uploadSuccessHandler,
          'upload:complete': () => (completed = true)
        }
      },
      {
        closeOnOuterClick: false,
        transitionWindow: fly,
        transitionWindowProps: {
          y: -200,
          duration: 500
        }
      },
      {
        onOpen: () => {
          dropzone = getDropzone();
        },
        beforeClose: () => {
          const queuedFiles = dropzone.getQueuedFiles();
          const uploadingFiles = dropzone.getUploadingFiles();
          if (queuedFiles.length || uploadingFiles.length) {
            const confirmed = confirm($_('text.files-in-upload-queue'));
            if (confirmed) {
              dropzone.removeAllFiles(true);
            }
            return confirmed;
          }
          return true;
        },
        onClosed: openEditor
      }
    );
  };

  function uploadSuccessHandler({ detail }: CustomEvent) {
    const { data, message, success }: any = { ...detail.responseText };

    configSnackbar(message);
    snackbar?.forceOpen();

    if (success) {
      uploadedData = data;
      emit('video:add', { data });
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

  function receiveListMethods({ detail }: CustomEvent) {
    listMethods = detail;
  }

  function scrollSelectedIntoView() {
    if (listMethods) {
      const { items } = listMethods;
      setTimeout(() => {
        const item = items.find((item: { selected: any }) => item.selected);
        item?.element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 100);
    }
  }
</script>

<Layout segment={$segment}>
  <div class="flex flex-1" slot="pagebar">
    <PageBar />
  </div>
  <slot />
  <div
    class="sidebar flex-1"
    slot="side"
    class:deep-search={isDeepSearch}
    class:hide-if-user={$session.role === USER}
  >
    <Container transparent>
      <div slot="header">
        <SearchTextField
          bind:search
          label={$_('text.search-users')}
          infoLabel={$_('text.type-min-char-count', { values: { count: minSearchChars } })}
        />
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
          user={$users?.find((user) => user.id === $session.user?.id) || undefined}
          ><div class="my-badge">
            <Icon class="material-icons">contact_page</Icon>
          </div>
        </SimpleUserCard>
        {#if filteredUsers.length}
          {#each filteredUsers as user (user.id)}
            <SimpleUserCard id={user.id} {selectionUserId} {user} />
          {/each}
          {#if !isDeepSearch}
            <Paginator
              {pagination}
              store={users}
              id="users-paginator"
              action="/users?/more"
              type='label'
              indicator
            />
          {/if}
        {/if}
      </List>
    </Container>
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
                emit(issue.eventType, { silent: true });
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
      <p>{@html $_('text.you-will-be-logged-out', { values: { name: username } })}</p>
    {/if}
    <div class="absolute" style="z-index: 1; top: -11px; right: 3px;">
      <UserGraphic
        size={40}
        borderSize={2}
        borderColor="--primary"
        extendedBorderSize={5}
        extendedBorderColor="--surface"
        dense
        user={selectedUser}
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
        size={35}
        borderSize={2}
        borderColor="--primary"
        extendedBorderSize={6}
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
      disabled={!!userIssues.length}
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
    <Fab class="floating-fab" color="primary" on:click={() => openUploader()} extended>
      <Label>{$_('text.add-video')}</Label>
      <Icon class="material-icons">add</Icon>
    </Fab>
  </div>
{/if}

<style>
  .sidebar {
    background: var(--background-intense);
    background: linear-gradient(
      90deg,
      var(--background) 0%,
      var(--background) 25%,
      var(--background-intense) 25%,
      var(--background-intense) 100%
    );
  }
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
    background: var(--background-intense);
    background: linear-gradient(
      90deg,
      var(--background) 0%,
      var(--background) 25%,
      var(--background-intense) 25%,
      var(--background-intense) 100%
    );
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
  .hide-if-user {
    display: none;
  }
</style>
