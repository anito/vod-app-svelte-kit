<script lang="ts">
  import './_switch.scss';
  import './_button.scss';
  import './_icon-button.scss';
  import './_icon_size.scss';
  import { enhance } from '$app/forms';
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { session, users } from '$lib/stores';
  import { emit, ADMIN, SUPERUSER, post, parseLifetime, EDIT, PASS, DEL, ADD } from '$lib/utils';
  import Textfield from '@smui/textfield';
  import TextfieldIcon from '@smui/textfield/icon';
  import HelperText from '@smui/textfield/helper-text';
  import Button, { Group, Label, Icon } from '@smui/button';
  import FormField from '@smui/form-field';
  import Switch from '@smui/switch';
  import Select, { Option } from '@smui/select';
  import SelectIcon from '@smui/select/icon';
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import {
    Container,
    InfoChips,
    TokenInfo,
    MediaUploader,
    UserGraphic,
    FlexContainer,
    Heading
  } from '$lib/components';
  import { _ } from 'svelte-i18n';
  import type Snackbar from '@smui/snackbar';
  import type { User } from '$lib/classes/repos/types';
  import type { ActionResult } from '@sveltejs/kit';

  const { setFab }: any = getContext('fab');
  const { open, close }: any = getContext('default-modal');
  const { getSnackbar, configSnackbar }: any = getContext('snackbar');

  const privilegedActions = [EDIT, PASS, DEL];
  const userActions = [EDIT, PASS];
  const setCopyButton = (node: any) => (copyButton = node);
  const setMagicLinkInput = (node: any) => (inputElementMagicLink = node);
  const actionsLookup = new Set([
    { name: EDIT, i18n: 'text.edit-user', formAction: 'edit' },
    { name: PASS, i18n: 'text.edit-password', formAction: 'edit' },
    { name: DEL, i18n: 'text.delete-user', formAction: 'del' },
    { name: ADD, i18n: 'text.add-user', formAction: 'add' }
  ]);

  export let selectionUserId = '';
  export let selectedMode = EDIT;

  let code;
  let root: HTMLElement;
  let invalidEmail = false;
  let password = '';
  let repeatedPassword = '';
  let snackbar: Snackbar;
  let message;
  let avatarMenu: Menu;
  let avatarMenuAnchor;
  let jwt = '';
  let activeLabel = '';
  let protectedLabel = '';
  let inputElementMagicLink: HTMLInputElement;
  let copyTimeoutId: number | undefined;
  let copyButton: HTMLButtonElement;
  let group_id: string;
  let name = '';
  let email = '';
  let active = false;
  let __protected = false;
  let mode: string;

  $: token = $session.user?.jwt;
  $: groups = $session.groups || [];
  $: selectedUser = ((id) => {
    const user = $users.find((usr) => usr?.id === id) as User | undefined;
    if (user && selectedMode !== ADD) {
      copy(user);
    }
    return user;
  })(selectionUserId);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: hasCurrentPrivileges = selectedUser?.role === ADMIN || selectedUser?.role === SUPERUSER;
  $: isSuperuser = $session.role === SUPERUSER;
  $: isCurrentSuperuser = selectedUser?.role === SUPERUSER;
  $: isProtected = isCurrentSuperuser ? (!isSuperuser ? true : false) : !hasPrivileges;
  $: hidden = selectedUser?.id === $session.user?.id;
  $: notFound =
    selectedMode !== ADD &&
    selectionUserId &&
    undefined === $users?.find((user) => user.id === selectionUserId);
  $: _name = ((user) => user?.name || '')(selectedMode !== ADD ? selectedUser : undefined);
  $: _active = ((usr) => usr?.active || false)(selectedMode !== ADD ? selectedUser : undefined);
  $: _protected = ((usr) => usr?.protected || false)(
    selectedMode !== ADD ? selectedUser : undefined
  );
  $: _email = ((usr) => usr?.email || '')(selectedMode !== ADD ? selectedUser : undefined);
  $: _group_id = ((usr) => usr?.group_id || '')(selectedMode !== ADD ? selectedUser : undefined);
  $: invalidPassword = password.length < 8;
  $: invalidRepeatedPassword = password !== repeatedPassword || invalidPassword;
  $: canSave =
    selectedMode === ADD
      ? name && group_id && !invalidEmail && !invalidRepeatedPassword
      : name !== _name ||
        (email !== _email && !invalidEmail) ||
        active !== _active ||
        group_id !== _group_id ||
        __protected !== _protected;
  $: canReset =
    name !== _name ||
    email !== _email ||
    active !== _active ||
    group_id != _group_id ||
    __protected != _protected ||
    password ||
    repeatedPassword;
  $: selectionUserId && resetPassword();
  $: actions = hasPrivileges ? privilegedActions : userActions;
  $: userCan = ((userActions) =>
    [...actionsLookup].filter((userAction) =>
      userActions.find((usrAction) => userAction.name === usrAction)
    ))(actions);
  $: ((user) => {
    jwt = user?.jwt || '';
    activeLabel = (active && $_('text.deactivate-user')) || $_('text.activate-user');
    protectedLabel = (__protected && $_('text.unprotect-user')) || $_('text.protect-user');
  })(selectedUser);
  $: magicLink = (jwt && `${$page.url.origin}/login?token=${jwt}`) || '';
  $: formAction = [...actionsLookup].find((action) => action.name === selectedMode)?.formAction;
  $: selectedMode = $page.url.searchParams.get('mode') || (mode = EDIT);
  $: ((mode) => {
    root?.classList.toggle('user-add-view', mode === ADD);
    root?.classList.toggle('user-edit-view', mode === EDIT);
    root?.classList.toggle('user-password-view', mode === PASS);
    root?.classList.toggle('user-delete-view', mode === DEL);
    if (hasPrivileges && mode !== ADD) {
      setFab('add-user');
    } else {
      setTimeout(() => reset(), 100);
      setFab();
    }
  })(selectedMode);
  $: browser && setMode($page.url.searchParams.get('mode') || EDIT);

  onMount(() => {
    root = document.documentElement;
    root.classList.add('usermanager--open');
    snackbar = getSnackbar();

    return () => {
      root.classList.remove(
        'usermanager--open',
        'user-add-view',
        'user-edit-view',
        'user-password-view',
        'user-delete-view'
      );
    };
  });

  let openUploader = () => {
    avatarMenu?.setOpen(false);

    open(MediaUploader, {
      props: {
        type: 'avatar',
        uid: selectedUser?.id,
        options: {
          parallelUploads: 1,
          maxFiles: 1
        },
        events: { 'upload:success': uploadSuccessHandler }
      },
      options: {
        transitionWindow: fly,
        transitionWindowProps: {
          y: -200,
          duration: 500
        }
      },
      headerProps: { type: $_('text.avatar') }
    });
  };

  function setMode(mode: string) {
    const searchParams = new URLSearchParams($page.url.search);
    searchParams.set('mode', mode);
    goto(`${$page.url.pathname}?${searchParams.toString()}`);
  }

  async function uploadSuccessHandler({ detail }: CustomEvent) {
    const { success, message, data }: any = { ...detail.responseText };

    if (success) {
      // reflect the change in the session cookie
      if ($session.user.id === data.id) {
        await post('/session', {
          ...$session,
          user: { ...$session.user, avatar: data.avatar }
        });
        await invalidate('app:session');
      }
      await invalidate('app:main');
    }
    close();
    configSnackbar(message);
    snackbar?.forceOpen();
  }

  async function deleteAvatar() {
    let msg;
    await api
      .del(`avatars/${selectedUser?.avatar.id}?locale=${$session.locale}`, { token })
      .then(async (res) => {
        const { data, success, message }: any = { ...res };
        msg = message || res.data?.message;

        if (success) {
          // reflect the change in the session cookie
          if ($session.user.id === selectedUser?.id) {
            await post('/session', {
              ...$session,
              user: { ...$session.user, avatar: data.avatar }
            });
            await invalidate('app:session');
          }
          await invalidate('app:main');
        }
      });

    configSnackbar(msg);
    snackbar?.forceOpen();
  }

  async function activateUser() {
    await api
      .put(`users/${selectionUserId}?locale=${$session.locale}`, {
        data: { active },
        token
      })
      .then((res) => {
        if (res) {
          message = res.message || res.data.message || res.statusText;
          code = (res.data && res.data.code) || res.status;

          if (res?.success) {
            users.put({ ...selectedUser, active });
          } else if (200 < code && code < 500) {
            // Sample Users are protected
            reset();
          }

          configSnackbar(message);
          snackbar?.forceOpen();
        }
      });
  }

  async function changeProtection() {
    await api
      .put(`users/${selectionUserId}`, {
        data: { protected: __protected },
        token
      })
      .then((res) => {
        if (res) {
          message = res.message || res.data.message || res.statusText;
          code = (res.data && res.data.code) || res.status;

          if (res?.success) {
            users.put({ ...selectedUser, protected: __protected });
          } else if (200 < code && code < 500) {
            // Sample Users are protected
            reset();
          }

          configSnackbar(message);
          snackbar?.forceOpen();
        }
      });
  }

  function copy(user: User<Record<any, any>>) {
    ({ name, email, active, group_id, __protected } = { ...user, __protected: !!user.protected });
  }

  function reset() {
    __protected = _protected;
    active = _active;
    email = _email;
    name = _name;
    group_id = _group_id;
    resetPassword();
  }

  function resetPassword() {
    password = repeatedPassword = '';
  }

  function copyToClipBoard() {
    if (inputElementMagicLink) {
      let didCopy;
      let inputEl;
      let label = copyButton.getElementsByClassName('token-button-label').item(0) as HTMLElement;
      inputEl = inputElementMagicLink.getElementsByTagName('input').item(0);
      inputEl?.focus();
      inputEl?.select();
      didCopy = document.execCommand('copy');
      if (didCopy) {
        label && (label.innerText = $_('text.copied'));
        clearTimeout(copyTimeoutId);
        copyTimeoutId = setTimeout(() => (label.innerText = $_('text.copy')), 4000);
      }
    }
  }

  function formHandler({ cancel }: { cancel: any }) {
    switch (formAction) {
      case 'del': {
        if (
          !confirm(
            $_('messages.permanently-remove-user', {
              values: { name: selectedUser?.name }
            })
          )
        )
          cancel();
        break;
      }
    }

    return actionResultHandler;
  }

  async function actionResultHandler({ result }: { result: ActionResult }) {
    if (result.type === 'success') {
      if (result.data) {
        const { success, message: message$1, data: user }: any = { ...result.data };
        const { message: message$2 }: any = { ...user };
        switch (formAction) {
          case 'add': {
            if (success) {
              users.add([user]);
              setTimeout(async () => {
                await goto(`/users/${user.id}?tab=profile&mode=edit`);
              }, 200);
            }
            mode = EDIT;
            break;
          }
          case 'edit': {
            if (success) {
              users.put(user);
              if ($session.user?.id === user.id) {
                const { id, name, email, avatar, jwt, role, groups }: User = user;
                const lifetime = parseLifetime($page.data.config?.Session.lifetime);
                const _expires = new Date(Date.now() + lifetime).toISOString();
                await post('/session', {
                  user: { id, name, email, jwt, avatar },
                  role,
                  groups,
                  _expires
                });
                await invalidate('app:session');
              }
            }
            break;
          }
          case 'del': {
            if (success) {
              users.del(selectedUser?.id);
            }
            mode = EDIT;
            break;
          }
        }
        reset();
        configSnackbar(message$1 || message$2);
        snackbar?.forceOpen();
      }
    }
  }
</script>

<div class="main-grid">
  {#if $session.user}
    <div class="grid-item user" style="height: 100%;">
      <Container density="sm" extended variant="primary">
        <div slot="header">
          <span class="flex">
            <Heading mdc h="5" class="ml-2">
              {#if selectedMode === ADD}
                {$_('text.create-new-user')}
              {:else if selectedUser}
                {selectedUser?.name}
              {/if}
            </Heading>
            {#if selectedMode === ADD}
              <button on:click={() => setMode(EDIT)} class="button-close" />
            {/if}
          </span>
        </div>
        <div class="flex flex-shrink flex-wrap height-100" style="height: 100%;">
          {#if notFound}
            <div class="exception user-not-found">
              <div class="flex justify-center items-center flex-1">
                <FlexContainer>
                  {$_('text.empty-user-selection')}
                </FlexContainer>
              </div>
            </div>
          {:else}
            {#if selectionUserId && selectedMode !== ADD}
              <div
                class="avatar-container"
                on:keydown={() => {}}
                on:click={() => avatarMenu?.setOpen(true)}
              >
                <div bind:this={avatarMenuAnchor} use:Anchor>
                  <UserGraphic
                    size={100}
                    user={selectedUser}
                    borderSize={4}
                    borderColor="--primary"
                    extendedBorderColor="--background-intense"
                    extendedBorderSize={10}
                    badge={hasCurrentPrivileges
                      ? {
                          icon: 'admin_panel_settings',
                          color: isCurrentSuperuser ? 'rgb(26, 4, 4)' : 'rgb(206, 4, 4)',
                          size: 'large',
                          position: 'BOTTOM_RIGHT'
                        }
                      : false}
                  />
                  <Menu
                    bind:this={avatarMenu}
                    anchor={false}
                    bind:anchorElement={avatarMenuAnchor}
                    anchorCorner="TOP_END"
                  >
                    <List>
                      <Item on:click={openUploader}>
                        <Text
                          >{selectedUser?.avatar
                            ? $_('text.change-avatar')
                            : $_('text.add-avatar')}</Text
                        >
                      </Item>
                      <Item disabled={!selectedUser?.avatar} on:click={() => deleteAvatar()}>
                        <Text>{$_('text.remove-avatar')}</Text>
                      </Item>
                    </List>
                  </Menu>
                </div>
              </div>
            {/if}
            <form use:enhance={formHandler} action={`?/${formAction}`} method="POST">
              <div class="user-items h-full">
                {#if selectedMode !== ADD}
                  <div class="flex justify-between flex-wrap">
                    <div class="select-item item">
                      <Select
                        bind:value={mode}
                        label={$_('text.select-mode')}
                        class="select-width"
                        menu$class="select-width"
                        variant="filled"
                      >
                        {#each userCan as can}
                          <Option value={can.name} selected={mode === can.name}>
                            {$_(can.i18n)}
                          </Option>
                        {/each}
                      </Select>
                    </div>
                    {#if selectedMode === EDIT && hasPrivileges}
                      <div class="switches-wrapper">
                        <div class="item flex flex-col items-center">
                          <div class="ml-3" style="flex: 0.5;">
                            <FormField>
                              <Switch
                                class="user-activation"
                                bind:checked={active}
                                on:SMUISwitch:change={activateUser}
                              />
                              <span slot="label" class="switch-label">{activeLabel}</span>
                            </FormField>
                          </div>
                          {#if isSuperuser}
                            <div class="item flex items-center">
                              <div class="ml-3" style="flex: 0.5;">
                                <FormField>
                                  <Switch
                                    class="user-protection"
                                    bind:checked={__protected}
                                    on:SMUISwitch:change={changeProtection}
                                  />
                                  <span slot="label" class="switch-label">{protectedLabel}</span>
                                </FormField>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}
                {#if selectedMode === ADD || selectedMode === EDIT}
                  <div class="item">
                    <Textfield bind:value={name} label="Name" type="text" input$name="name">
                      <TextfieldIcon slot="leadingIcon" class="material-icons"
                        >contact_page</TextfieldIcon
                      >
                      <HelperText slot="helper" id="helper-text-name"
                        >{$_('text.your-name')}</HelperText
                      >
                    </Textfield>
                  </div>
                  <div class="item">
                    <Textfield
                      class="w-full"
                      bind:value={email}
                      bind:invalid={invalidEmail}
                      label="Email"
                      type="email"
                      updateInvalid
                      input$autocomplete="email"
                      input$name="email"
                    >
                      <TextfieldIcon
                        slot="leadingIcon"
                        class="material-icons"
                        style="line-height: normal; vertical-align: middle;">email</TextfieldIcon
                      >
                      <HelperText slot="helper" id="helper-text-email" validationMsg
                        >{$_('text.invalid-email')}</HelperText
                      >
                    </Textfield>
                  </div>

                  <div class="item">
                    <Select
                      disabled={!hasPrivileges}
                      label={$_('text.user-role')}
                      class="select-width"
                      name="group_id"
                      bind:value={group_id}
                    >
                      <input type="hidden" name="group_id" bind:value={group_id} />
                      <SelectIcon slot="leadingIcon" class="material-icons">contact_page</SelectIcon
                      >
                      <Option selected={true}>{$_('text.please-select')}</Option>
                      {#each groups as group}
                        <Option value={group.id} selected={group_id === group.id}>
                          {$_(group.name)}
                        </Option>
                      {/each}
                    </Select>
                  </div>
                {/if}
                {#if selectedMode === ADD || selectedMode === PASS}
                  <div class="item">
                    <Textfield
                      type="password"
                      bind:invalid={invalidPassword}
                      bind:value={password}
                      label={$_('text.password')}
                      name="password"
                      style="min-width: 250px;"
                      input$name="password"
                    >
                      <TextfieldIcon slot="leadingIcon" class="material-icons"
                        >fingerprint</TextfieldIcon
                      >
                      <HelperText slot="helper" id="helper-password"
                        >{$_('text.password-hint')}</HelperText
                      >
                    </Textfield>
                  </div>
                  <div class="item">
                    <Textfield
                      type="password"
                      disabled={invalidPassword}
                      bind:invalid={invalidRepeatedPassword}
                      bind:value={repeatedPassword}
                      label={$_('text.repeat-password')}
                    >
                      <TextfieldIcon slot="leadingIcon" class="material-icons"
                        >fingerprint</TextfieldIcon
                      >
                      <HelperText slot="helper" id="helper-password-repeat">
                        {$_('text.invalid-password')}
                      </HelperText>
                    </Textfield>
                  </div>
                {/if}
                {#if selectedMode === ADD || selectedMode === EDIT || selectedMode === PASS}
                  <div class="item">
                    <div class="button-group">
                      <Group>
                        <Button
                          disabled={selectedMode === PASS ? invalidRepeatedPassword : !canSave}
                          color="primary"
                          variant="unelevated"
                        >
                          <Label>{$_('text.save')}</Label>
                          <Icon class="material-icons">save</Icon>
                        </Button>
                        <Button
                          disabled={!canReset}
                          type="reset"
                          color="primary"
                          on:click={() => reset()}
                          variant="unelevated"
                        >
                          <Label>{$_('text.reset')}</Label>
                          <Icon class="material-icons">settings_backup_restore</Icon>
                        </Button>
                      </Group>
                    </div>
                  </div>
                {/if}
                {#if selectedMode === DEL}
                  <div class="item">
                    <div class="alert-box mt-3" role="alert">
                      <div class="alert-head rounded-t px-4 py-2">
                        {$_('text.caution')}
                      </div>
                      <div class="alert-body border border-t-0 rounded-b bg-warning-100 px-4 py-3">
                        <p>{$_('text.you-cant-revert-deletion-of-user')}</p>
                        <Button class="error mt-5" variant="unelevated">
                          <Label>{$_('text.delete-user')}</Label>
                          <Icon class="material-icons">delete</Icon>
                        </Button>
                      </div>
                    </div>
                  </div>
                {/if}
                {#if !selectedMode}
                  <FlexContainer>
                    {$_('text.empty-edit-mode')}
                  </FlexContainer>
                {/if}
              </div>
            </form>
          {/if}
          {#if selectedUser && hasPrivileges && selectedMode !== ADD}
            <div class="table-wrapper">
              <div class="token-factory" class:no-token={!jwt}>
                <div class="main-info">
                  <div class="button-group token-action-buttons flex mt-1 mb-3">
                    <Group>
                      <Button
                        class="magic-link"
                        variant="raised"
                        disabled={isProtected}
                        on:click={() =>
                          !isProtected && emit('info:token:generate', { open: !!jwt })}
                      >
                        <Icon class="material-icons">link</Icon>
                        <Label class="token-button-label">
                          {$_('text.generate-token')}
                        </Label>
                      </Button>
                      <Button
                        disabled={isProtected || !jwt}
                        label={$_('text.can-not-remove-admin-token')}
                        variant="raised"
                        on:click={() => !isProtected && emit('info:token:remove', { open: true })}
                      >
                        <Icon class="material-icons">link_off</Icon>
                        <Label class="token-button-label">{$_('text.remove-token')}</Label>
                      </Button>
                    </Group>
                  </div>
                  <div class="item ">
                    <TokenInfo {selectionUserId} />
                  </div>
                  <div class="item info-section">
                    <InfoChips {selectionUserId} />
                  </div>
                  <div class="item">
                    {#if jwt}
                      <div
                        class="button-group magic-link-button-group token-action-buttons flex mb-3"
                      >
                        <Group style="max-width: 100%;">
                          <Button
                            disabled={isProtected || hidden}
                            class="action-magic-link"
                            on:click={() => !isProtected && emit('info:token:redirect')}
                            variant="outlined"
                          >
                            <Icon class="material-icons">link</Icon>
                            <Label class="token-button-label">Magic Link</Label>
                          </Button>
                          <Button
                            href={`${$page.url.pathname}?tab=mail&active=template:magic-link`}
                            class="action-email flex-1"
                            variant="unelevated"
                          >
                            <Icon class="material-icons">send</Icon>
                            <Label class="token-button-label">
                              {$_('text.email')}
                            </Label>
                          </Button>
                          <Button
                            class="input"
                            use={[setMagicLinkInput]}
                            disabled={isProtected || !jwt}
                            variant="outlined"
                          >
                            <input type="text" value={isProtected ? '' : magicLink} />
                          </Button>
                          <Button
                            use={[setCopyButton]}
                            class="action-copy"
                            disabled={isProtected || !jwt}
                            variant="unelevated"
                            on:click={(e) => !isProtected && copyToClipBoard()}
                          >
                            <Icon class="material-icons">file_copy</Icon>
                            <Label class="token-button-label">
                              {$_('text.copy')}
                            </Label>
                          </Button>
                        </Group>
                      </div>
                    {/if}
                  </div>
                </div>
                <div class="additional-info">
                  {#if jwt}
                    <div class="item">
                      <h5 class="mb-4">{$_('text.next-steps')}</h5>
                      <details>
                        <summary>{$_('summary.test-magic-link.header')}</summary>
                        <p>
                          {@html $_('summary.test-magic-link.text', {
                            values: {
                              currentUserName: selectedUser?.name,
                              sessionUserName: $session.user?.name
                            }
                          })}
                        </p>
                      </details>
                      <details>
                        <summary>{$_('summary.send-email.header')}</summary>
                        <p>
                          {@html $_('summary.send-link.text')}
                        </p>
                      </details>
                      <details>
                        <summary>{@html $_('summary.copy-link.header')}</summary>
                        <p>{@html $_('summary.copy-link.text')}</p>
                      </details>
                    </div>
                  {/if}
                </div>
                <div class="item">
                  <span>
                    <Icon class="material-icons">info</Icon>
                    <a
                      href="."
                      class="item"
                      on:click|preventDefault={() => emit('info:open:help-dialog')}
                    >
                      {$_('summary.howDoesItWork.text')}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </Container>
    </div>
  {:else}
    <FlexContainer style="grid-area: one;">
      {$_('text.empty-user-selection')}
    </FlexContainer>
  {/if}
</div>

<style lang="scss">
  .main-grid {
    grid-area: main;
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap-sm);
    align-items: center;
    grid-template-areas: 'one one';
    grid-template-columns: 4fr 4fr;
    grid-template-rows: auto;
    align-items: initial;
    background-color: var(--background);
    overflow: auto;
  }
  form {
    position: relative;
    flex: 1;
  }
  .grid-item {
    background: var(--background-intense);
  }
  .user {
    grid-area: one;
    overflow: auto;
  }
  .user-items {
    display: flex;
    flex-direction: column;
  }
  .item:not(:last-child) {
    margin-bottom: 1.1rem;
  }
  :global(.item > label) {
    width: 100%;
  }
  .exception {
    display: flex;
    text-align: center;
    flex: 1 0 0%;
    justify-content: center;
  }
  .avatar-container {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 50px;
    top: 20px;
    cursor: pointer;
    z-index: 1;

    :global(img) {
      cursor: pointer;
    }
  }
  .table-wrapper {
    flex: 1;
    background: var(--background);
    margin-left: 3rem;
    border-radius: 2px;
    padding: 30px;
  }
  .token-factory {
    > *:nth-child(1) {
      padding-bottom: 0;
    }
    > *:nth-child(2) {
      padding-top: 0;
    }
    .item:last-child {
      margin-bottom: 2em;
    }
    &.no-token :global(button.magic-link) {
      background-color: var(--error);
    }
    .additional-info {
      overflow: auto;
    }
    .item {
      font-size: 0.8rem;
    }
  }
  .item :global(.material-icons.mdc-button__icon) {
    vertical-align: middle;
  }
  .token-action-buttons :global(.token-button-label) {
    font-size: 0.6rem;
    max-width: 130px;
  }
  .button-group {
    :global(.smui-button__group) {
      flex: 1;
    }
    :global(button) {
      flex: 1;
    }
  }
  .magic-link-button-group {
    > :global(.smui-button__group > button.action-magic-link) {
      flex: 0 1 33.3333%;
    }
    > :global(.smui-button__group > button.action-email) {
      flex: 0 1 33.3333%;
    }
    > :global(.smui-button__group > button.input) {
      position: absolute;
      right: 9999999px;
      font-size: 0.1em;
      width: 1px;
      height: 1px;
    }
    > :global(.smui-button__group > button.action-copy) {
      flex: 0 1 33.3333%;
    }
  }
  .button-close {
    display: none;
  }
  .switch-label {
    display: block;
    max-width: 100%;
    width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item.info-section {
    padding: 10px;
    min-height: 90px;
    align-items: center;
    font-size: 0.9em;
    background: var(--surface);
    color: #c8dbe3;
  }
  :global(.user-add-view) .button-close {
    display: block;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
  }
  .alert-box {
    display: table;
    margin-bottom: 1em;
    .alert-head {
      background-color: var(--mdc-theme-error);
      color: var(--mdc-theme-on-error);
    }
    .alert-body {
      border-color: var(--mdc-theme-error);
    }
  }
</style>
