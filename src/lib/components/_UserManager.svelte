<script>
  import './_switch.scss';
  import './_button.scss';
  import './_icon_size.scss';
  import { enhance } from '$app/forms';
  import * as api from '$lib/api';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import Header from './_Header.svelte';
  import { fly } from 'svelte/transition';
  import { session, users } from '$lib/stores';
  import { proxyEvent, ADMIN, SUPERUSER, post, log } from '$lib/utils';
  import Textfield from '@smui/textfield';
  import TextfieldIcon from '@smui/textfield/icon';
  import HelperText from '@smui/textfield/helper-text';
  import Button, { Group, Label, Icon } from '@smui/button';
  import FormField from '@smui/form-field';
  import Switch from '@smui/switch';
  import Select, { Option } from '@smui/select';
  import SelectIcon from '@smui/select/icon';
  import Paper, { Title } from '@smui/paper';
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Separator, Text } from '@smui/list';
  import { Component, InfoChips, TokenInfo, MediaUploader, UserGraphic } from '$lib/components';
  import { _ } from 'svelte-i18n';

  const { setFab } = getContext('fab');
  const { open, close } = getContext('default-modal');
  const { getSnackbar, configSnackbar } = getContext('snackbar');

  const EDIT = 'edit';
  const ADD = 'add';
  const DEL = 'del';
  const PASS = 'pass';
  const privilegedActions = [EDIT, PASS, DEL];
  const userActions = [EDIT, PASS];

  /**  @type{string | null} */
  export let selectionUserId;
  /**  @type{string | null} */
  export let selectedMode = EDIT;

  /**  @type{number} */
  let code;
  /** @type {Element}*/
  let root;
  /**  @type{boolean} */
  let invalidEmail = false;
  /**  @type{string} */
  let password = '';
  /**  @type{string} */
  let repeatedPassword = '';
  /** @type {import("@smui/snackbar").SnackbarComponentDev} */
  let snackbar;
  /**  @type{string} */
  let message;

  /** @type {import('@smui/menu').MenuComponentDev} */
  let avatarMenu;
  let avatarMenuAnchor;
  let jwt = '';
  let activeLabel = '';
  let protectedLabel = '';
  /** @type {HTMLInputElement} */
  let inputElementMagicLink;
  /** @type {ReturnType <typeof setTimeout>} */
  let copyTimeoutId;
  /** @type {HTMLButtonElement} */
  let copyButton;
  /** @param {HTMLButtonElement | any} node */
  let setCopyButton = (node) => (copyButton = node);
  /** @type {string} */
  let group_id;
  let name = '';
  let email = '';
  let active = false;
  let __protected = false;
  /** @type {string} */
  let mode = EDIT;

  $: token = $session.user?.jwt;
  $: redirectMode(mode);
  $: selectedMode = $page.url.searchParams.has('mode')
    ? $page.url.searchParams.get('mode')
    : (mode = EDIT);
  $: ((mode) => {
    if (hasPrivileges && mode !== ADD) {
      setFab('add-user');
    } else {
      setTimeout(() => reset(), 100);
      setFab();
    }
  })(selectedMode);
  $: root?.classList.toggle('user-add-view', selectedMode === ADD);
  $: root?.classList.toggle('user-edit-view', selectedMode === EDIT);
  $: root?.classList.toggle('user-password-view', selectedMode === PASS);
  $: root?.classList.toggle('user-delete-view', selectedMode === DEL);
  $: groups = $session.groups || [];
  $: currentUser = ((id) => {
    const user = $users.find((usr) => usr?.id === id);
    if (user && selectedMode !== ADD) {
      copy(user);
    }
    return user;
  })(selectionUserId);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: hasCurrentPrivileges = currentUser?.role === ADMIN || currentUser?.role === SUPERUSER;
  $: isSuperuser = $session.role === SUPERUSER;
  $: isCurrentSuperuser = currentUser?.role === SUPERUSER;
  $: isProtected = isCurrentSuperuser ? (!isSuperuser ? true : false) : !hasPrivileges;
  $: hidden = currentUser?.id === $session.user?.id;
  $: notFound =
    selectedMode !== ADD &&
    selectionUserId &&
    undefined === $users.find((u) => u.id === selectionUserId);
  $: _name = ((usr) => usr?.name || '')(selectedMode !== ADD ? currentUser : false);
  $: _active = ((usr) => usr?.active || false)(selectedMode !== ADD ? currentUser : false);
  $: _protected = ((usr) => usr?.protected || false)(selectedMode !== ADD ? currentUser : false);
  $: _email = ((usr) => usr?.email || '')(selectedMode !== ADD ? currentUser : false);
  $: _group_id = ((usr) => usr?.group_id || void 0)(selectedMode !== ADD ? currentUser : false);
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
    group_id !== _group_id ||
    __protected !== _protected ||
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
  })(currentUser);
  $: magicLink = (jwt && `${$page.url.origin}/login?token=${jwt}`) || '';
  $: actionsLookup = new Set([
    { name: EDIT, i18n: 'text.edit-user', formAction: 'edit' },
    { name: PASS, i18n: 'text.edit-password', formAction: 'edit' },
    { name: DEL, i18n: 'text.delete-user', formAction: 'del' },
    { name: ADD, i18n: 'text.add-user', formAction: 'add' }
  ]);
  $: formAction = [...actionsLookup].find((action) => action.name === selectedMode)?.formAction;

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
    open(
      MediaUploader,
      {
        layoutProps: { type: $_('text.avatar') },
        type: 'avatar',
        uid: currentUser.id,
        options: {
          parallelUploads: 1,
          maxFiles: 1
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
      }
    );
  };

  /** @param {string | any} m */
  function redirectMode(m = EDIT) {
    if (browser) {
      mode = m;
      $page.url.searchParams.set('mode', mode);
      goto(`${$page.url.pathname}${$page.url.search}`);
    }
  }

  /** @param {CustomEvent} param0 */
  async function uploadSuccessHandler({ detail }) {
    /** @type {any} */
    const { success, message, data } = { ...detail.responseText };

    if (success) {
      // reflect the change in the session cookie
      if ($session.user.id === data.id) {
        await post('/session', {
          ...$session,
          user: { ...$session.user, avatar: data.avatar }
        });
        await invalidate('app:session');
      }
      await invalidate('app:users');
    }
    close();
    configSnackbar(message);
    snackbar.open();
  }

  async function deleteAvatar() {
    let msg;
    await api.del(`avatars/${currentUser.avatar.id}`, { token }).then(async (res) => {
      /** @type {any} */
      const { data, success, message } = { ...res };
      msg = message || res.data?.message;

      if (success) {
        // reflect the change in the session cookie
        if ($session.user.id === currentUser.id) {
          await post('/session', {
            ...$session,
            user: { ...$session.user, avatar: data.avatar }
          });
          await invalidate('app:session');
        }
        await invalidate('app:users');
      }
    });

    configSnackbar(msg);
    snackbar.open();
  }

  async function activateUser() {
    await api.put(`users/${selectionUserId}`, { data: { active }, token }).then((res) => {
      if (res) {
        message = res.message || res.data.message || res.statusText;
        code = (res.data && res.data.code) || res.status;

        if (res?.success) {
          users.put({ ...currentUser, active });
        } else if (200 < code && code < 500) {
          // Sample Users are protected
          reset();
        }

        configSnackbar(message);
        snackbar.isOpen() && snackbar.close();
        snackbar.open();
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
            users.put({ ...currentUser, protected: __protected });
          } else if (200 < code && code < 500) {
            // Sample Users are protected
            reset();
          }

          configSnackbar(message);
          snackbar.isOpen() && snackbar.close();
          snackbar.open();
        }
      });
  }

  /** @param {import('$lib/types').User} user */
  function copy(user) {
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
      /** @type {boolean} */
      let didCopy;
      /** @type {HTMLInputElement | null} */
      let inputEl;
      /** @type {HTMLLabelElement | any} */
      let label = copyButton.getElementsByClassName('token-button-label').item(0);
      inputEl = inputElementMagicLink.getElementsByTagName('input').item(0);
      inputEl?.focus();
      inputEl?.select();
      didCopy = document.execCommand('copy');
      if (didCopy) {
        label.innerText = $_('text.copied');
        clearTimeout(copyTimeoutId);
        copyTimeoutId = setTimeout(() => (label.innerText = $_('text.copy')), 4000);
      }
    }
  }

  async function closeAddUserHandler() {
    redirectMode(EDIT);
  }
</script>

<div class="main-grid">
  {#if $session.user}
    <div class="grid-item user" style="height: 100%;">
      <Component variant="sm" extended>
        <div slot="header">
          <Header mdc h="5" style="padding-right: 12rem;">
            {#if selectedMode === ADD}
              {$_('text.create-new-user')}
              <button on:click={closeAddUserHandler} class="button-close">
                <Icon class="material-icons" style="vertical-align: middle;">close</Icon>
              </button>
            {:else if currentUser}
              {currentUser.name}
            {/if}
          </Header>
        </div>
        <div class="flex flex-shrink flex-wrap height-100" style="height: 100%;">
          {#if notFound}
            <div class="exception user-not-found">
              <div class="flex justify-center items-center flex-1">
                <div class="empty-selection">
                  <span style="text-align: center;">{$_('text.empty-user-selection')}</span>
                </div>
              </div>
            </div>
          {:else}
            {#if selectionUserId && selectedMode !== ADD}
              <div
                class="avatar-container"
                on:keydown={() => {}}
                on:click={() => avatarMenu.setOpen(true)}
              >
                <div bind:this={avatarMenuAnchor} use:Anchor>
                  <UserGraphic
                    size="100"
                    user={currentUser}
                    borderSize="4"
                    borderColor="--primary"
                    extendedBorderColor="--back-grid-item"
                    extendedBorderSize="10"
                    badge={{
                      icon: hasCurrentPrivileges ? 'admin_panel_settings' : '',
                      color: isCurrentSuperuser ? 'rgb(26, 4, 4)' : 'rgb(206, 4, 4)',
                      size: 'large',
                      position: 'BOTTOM_RIGHT'
                    }}
                  />
                  <Menu
                    bind:this={avatarMenu}
                    anchor={false}
                    bind:anchorElement={avatarMenuAnchor}
                    anchorCorner="TOP_END"
                  >
                    <List>
                      <Item on:click={() => openUploader()}>
                        <Text
                          >{currentUser.avatar
                            ? $_('text.change-avatar')
                            : $_('text.add-avatar')}</Text
                        >
                      </Item>
                      <Item disabled={!currentUser.avatar} on:click={() => deleteAvatar()}>
                        <Text>{$_('text.remove-avatar')}</Text>
                      </Item>
                    </List>
                  </Menu>
                </div>
              </div>
            {/if}
            <form
              use:enhance={({ cancel }) => {
                switch (formAction) {
                  case 'del': {
                    if (
                      !confirm(
                        $_('messages.permanently-remove-user', {
                          values: { name: currentUser.name }
                        })
                      )
                    )
                      cancel();
                    break;
                  }
                }

                return async ({ result }) => {
                  if (result.type === 'success') {
                    /** @type {any | undefined} */
                    const { success, message: message$1, data: user } = { ...result.data };
                    /** @type {any | undefined} */
                    const { message: message$2 } = { ...user };
                    switch (formAction) {
                      case 'add': {
                        if (success) {
                          await invalidate('app:users');
                          setTimeout(async () => {
                            await goto(`/users/${user.id}?tab=profile&mode=edit`);
                          }, 200);
                        }
                        mode = EDIT;
                        break;
                      }
                      case 'edit': {
                        if (success) users.put(user);
                        break;
                      }
                      case 'del': {
                        if (success) {
                          await invalidate('app:users');
                        }
                        mode = EDIT;
                        break;
                      }
                    }
                    reset();
                    configSnackbar(message$1 || message$2);
                    snackbar.open();
                  }
                };
              }}
              action={`?/${formAction}`}
            >
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
                    <Textfield
                      bind:value={name}
                      label="Name"
                      type="text"
                      input$aria-controls="helper-text-name"
                      input$aria-describedby="helper-text-name"
                    >
                      <input type="hidden" name="name" bind:value={name} />
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
                    >
                      <input type="hidden" name="email" bind:value={email} />
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
                      input$aria-controls="helper-password"
                      input$aria-describedby="helper-password"
                      style="min-width: 250px;"
                    >
                      <input type="hidden" name="password" bind:value={password} />
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
                      input$aria-controls="helper-password-repeat"
                      input$aria-describedby="helper-password-repeat"
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
                    <div class="alert mt-3" role="alert">
                      <div class="mdc-theme-error-bg rounded-t px-4 py-2">
                        {$_('text.caution')}
                      </div>
                      <div
                        class="border border-t-0 rounded-b bg-warning-100 px-4 py-3 mdc-theme-error-color"
                      >
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
                  <div class="exception empty-selection">
                    <span style="text-align: center;">{$_('text.empty-edit-mode')}</span>
                  </div>
                {/if}
              </div>
            </form>
          {/if}
          {#if currentUser && hasPrivileges && selectedMode !== ADD}
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
                          !isProtected && proxyEvent('info:token:generate', { open: !!jwt })}
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
                        on:click={() =>
                          !isProtected && proxyEvent('info:token:remove', { open: true })}
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
                      <div class="button-group magic-link-group token-action-buttons flex mb-3">
                        <Group style="max-width: 100%;">
                          <Button
                            disabled={isProtected || hidden}
                            class="action-magic-link"
                            on:click={() => !isProtected && proxyEvent('info:token:redirect')}
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
                            use={[
                              /** @param {HTMLInputElement | any} node */ (node) =>
                                (inputElementMagicLink = node)
                            ]}
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
                              currentUserName: currentUser.name,
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
                      on:click|preventDefault={() => proxyEvent('info:open:info-dialog')}
                    >
                      {$_('summary.howDoesItWork.text')}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </Component>
    </div>
  {:else}
    <div class="empty-selection no-user-selection">
      <span style="text-align: center;">{$_('text.empty-user-selection')}</span>
    </div>
  {/if}
</div>

<style>
  .main-grid {
    grid-area: main;
    display: grid;
    grid-template-rows: var(--toolbar-h) auto;
    grid-gap: var(--grid-gap);
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
    background: var(--back-grid-item);
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
  .alert {
    display: table;
    margin-bottom: 1em;
  }
  .avatar-container {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 50px;
    top: 20px;
    cursor: pointer;
    z-index: 1;
  }
  .avatar-container :global(img) {
    cursor: pointer;
  }
  .table-wrapper {
    flex: 1;
    background: #fff;
    border: 1px solid #dcdcdc;
    margin-left: 3rem;
    border-radius: 2px;
    padding: 30px;
  }
  .token-factory > *:nth-child(1) {
    padding-bottom: 0;
  }
  .token-factory > *:nth-child(2) {
    padding-top: 0;
  }
  .token-factory .item:last-child {
    margin-bottom: 2em;
  }
  .token-factory.no-token :global(button.magic-link) {
    background-color: var(--error);
  }
  .token-factory .additional-info {
    overflow: auto;
  }
  .item :global(.material-icons.mdc-button__icon) {
    vertical-align: middle;
  }
  .token-factory .item {
    font-size: 0.8rem;
  }
  .token-action-buttons :global(.token-button-label) {
    font-size: 0.6rem;
    max-width: 130px;
  }
  .button-group :global(.smui-button__group) {
    flex: 1;
  }
  .button-group :global(button) {
    flex: 1;
  }
  .magic-link-group > :global(.smui-button__group > button.action-magic-link) {
    flex: 0 1 33.3333%;
  }
  .magic-link-group > :global(.smui-button__group > button.action-email) {
    flex: 0 1 33.3333%;
  }
  .magic-link-group > :global(.smui-button__group > button.input) {
    position: absolute;
    right: 9999999px;
    font-size: 0.1em;
    width: 1px;
    height: 1px;
  }
  .magic-link-group > :global(.smui-button__group > button.action-copy) {
    flex: 0 1 33.3333%;
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
    border: 1px solid #c8dbe3;
    background: #e0e9ee;
    color: #c8dbe3;
  }
  :global(.user-add-view) .button-close {
    display: block;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translate(50%, -50%);
  }
  .mdc-theme-error-bg {
    background-color: var(--mdc-theme-error);
    color: var(--mdc-theme-surface);
  }
  .mdc-theme-error-color {
    color: var(--mdc-theme-error);
    border-color: var(--mdc-theme-error);
  }
  .empty-selection {
    display: flex;
    grid-area: one;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 2em;
    font-weight: 600;
    color: #d8d8d8;
  }
</style>
