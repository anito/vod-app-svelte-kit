<script>
  import 'assets/base.css';
  import 'assets/app.css';
  import '$lib/components/_button.scss';
  import '$lib/components/_notched_outline.scss';
  import '$lib/components/_colored_snackbar.scss';
  import '$lib/components/_dialog.scss';
  import { derived, writable } from 'svelte/store';
  import { afterNavigate, beforeNavigate, goto, invalidate, invalidateAll } from '$app/navigation';
  import { navigating, page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { getContext, onMount, setContext, tick } from 'svelte';
  import isMobile from 'ismobilejs';
  import { Icons } from '$lib/components';
  import Button, { Icon } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { Item, Separator, Text } from '@smui/list';
  import Snackbar, { Actions as SnackbarActions } from '@smui/snackbar';
  import { Label } from '@smui/common';
  import {
    createRedirectSlug,
    createTabSearch,
    post,
    proxyEvent,
    svg,
    ADMIN,
    SUPERUSER,
    afterOrBeforeNavigation,
    parseLifetime,
    printDiff,
    info,
    parseConfigData,
    buildSearchParams,
    PAGINATORS
  } from '$lib/utils';
  import {
    fabs,
    flash,
    frameworks,
    salutation,
    settings,
    session,
    theme,
    ticker,
    urls,
    videos,
    users
  } from '$lib/stores';
  import { Modal, SvgIcon } from '$lib/components';
  import { DoubleBounce } from 'svelte-loading-spinners';
  import {
    FrameworkSwitcher,
    LoadingModal,
    LocaleSwitcher,
    MoreMenu,
    Nav,
    NavItem,
    UserGraphic
  } from '$lib/components';
  import { svg_manifest } from '$lib/svg_manifest';
  import { _, locale } from 'svelte-i18n';
  import Dialog, {
    Title as DialogTitle,
    Content,
    Actions as DialogActions,
    InitialFocus
  } from '@smui/dialog';

  const snackbarLifetime = 4000;
  const redirectDelay = 300;

  /**
   * @type {HTMLElement}
   */
  let root;
  /**
   * @type {HTMLDivElement}
   */
  let base;
  /**
   * @type {string}
   */
  let snackbarMessage = '';
  /**
   * @type {string | any}
   */
  let actionLink;
  /**
   * @type {string | any}
   */
  let actionLabel;
  /**
   * @type {ReturnType<typeof setTimeout>}
   */
  let timeoutId;
  /**
   * @type {ReturnType<typeof setTimeout>}
   */
  let navTimeoutId;
  /**
   * @type {ReturnType<typeof setInterval>}
   */
  let pollId;
  /**
   * @type {string}
   */
  let loggedInButtonTextSecondLine;
  /**
   * @type {string}
   */
  let emphasize;
  /**
   * @type {Snackbar}
   */
  let snackbar;
  /**
   * @type {Dialog}
   */
  let settingsDialog;
  /**
   * @type {number}
   */
  let loaderBackgroundOpacity = 1;
  /**
   * @type {string}
   */
  let loaderColor = 'var(--primary)';
  /**
   * @type {boolean}
   */
  let isMounted = false;
  /**
   * @type {import('./$types').LayoutData}
   */
  export let data;

  settings.subscribe((val) => {
    printDiff(val, { store: 'config' });
  });

  setContext('fab', {
    setFab: (/** @type {any} */ name) => fabs.update(name),
    restoreFab: () => fabs.restore()
  });

  setContext('snackbar', {
    getSnackbar: () => snackbar,
    configSnackbar
  });

  setContext('segment', {
    getSegment: () =>
      derived(page, ($page, set) => {
        const matches = $page.url.pathname.match(/\/([a-z_-]*)/) || [];
        if (matches.length >= 2) {
          if (matches[1] !== '') {
            set(matches[1]);
          } else {
            set('home');
          }
        }
      })
  });

  const editableSettings = new Map([
    ['Console', ['infoLevel']],
    ['Session', ['foo', 'bar']]
  ]);
  const { getSnackbar } = getContext('snackbar');
  const mounted = writable(isMounted);

  ticker.subscribe((val) => {
    info(
      5,
      '%c TICKER %c %s',
      'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
      'background: #ffff81; color: #000000; padding:4px 6px 3px 0;',
      `${(!isNaN(val) && val / 1000 + 's') || '--'}`
    );
    if (val === 0) {
      proxyEvent('session:stop');
    }
  });

  setContext('mounted', {
    mounted
  });

  const { getSegment } = getContext('segment');
  const segment = getSegment();

  // salutation.update(randomItem(data.config?.Site?.salutations) || 'Hi');

  /**
   *
   * @param {Map<string, any>} excludes
   * @param {import('@sveltejs/kit').AfterNavigate} param0
   */
  const afterNavigationCallback = async (excludes, { from, to }) => {
    if (excludes.size) {
      info(
        2,
        '%c Extend session prevented',
        'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
        excludes
      );
    } else {
      proxyEvent('session:extend');
    }
  };

  afterOrBeforeNavigation(
    afterNavigate,
    {
      to_searches: [],
      from_pathnames: [],
      to_pathnames: ['/auth?/logout', '/auth?/login', '/login', '/logout', '/config']
    },
    afterNavigationCallback
  );

  beforeNavigate(({ cancel }) => {
    if ($navigating) {
      cancel();
    }
  });

  $: printDiff($page.data, { store: 'page' });
  $: person = svg(svg_manifest.person, $theme.primary);
  $: logo = svg(svg_manifest.logo_vod, $theme.primary);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: root && ((user) => root.classList.toggle('loggedin', user))(!!$session.user);
  $: root && ((isPrivileged) => root.classList.toggle('admin', isPrivileged))(hasPrivileges);
  $: root && root.classList.toggle('home', $segment === 'home');
  $: if ($session.user) {
    loggedInButtonTextSecondLine = `${$salutation}, ${$session.user.name}`;
  }
  $: searchParamsString = $page.url.searchParams.toString();
  $: search = searchParamsString && `?${searchParamsString}`;
  $: settingsDialog?.setOpen($page.url.searchParams.get('modal') === 'settings');

  onMount(async () => {
    $mounted = true;
    root = document.documentElement;
    snackbar = getSnackbar();

    loadConfig();
    fadeIn();
    initListener();
    checkSession();
    initClasses();
    initStyles();
    startPolling();
    printCopyright();

    return () => {
      removeListener();
      removeClasses();
    };
  });

  async function checkSession() {
    const { user, _expires, fromToken } = { ...$session };
    if (!user || fromToken) return;

    const valid = new Date() < new Date(_expires);
    if (valid) {
      proxyEvent('session:success', $session);
    } else {
      proxyEvent('session:stop', {
        redirect: `/login`
      });
    }
  }

  function fadeIn() {
    setTimeout(() => {
      loaderBackgroundOpacity = 0.45;
      loaderColor = 'var(--flash)';
      base?.classList.remove('opacity-0');
    }, 400);
  }

  function initListener() {
    window.addEventListener('session:success', sessionSuccessHandler);
    window.addEventListener('session:error', sessionErrorHandler);
    window.addEventListener('session:stop', sessionStopHandler);
    window.addEventListener('session:extend', sessionExtendHandler);
    window.addEventListener('video:save', videoSaveHandler);
    window.addEventListener('video:delete', videoDeleteHandler);
    window.addEventListener('user:save', userSaveHandler);
    window.addEventListener('user:delete', userDeleteHandler);
  }

  function initClasses() {
    isMobile().any && root.classList.add('ismobile');
  }

  function initStyles() {
    let styles = window.getComputedStyle(root);
    theme.set({
      primary: styles.getPropertyValue('--primary'),
      secondary: styles.getPropertyValue('--secondary')
    });
  }

  function startPolling() {}

  /**
   *
   * @param {number} timestamp
   */
  function displayRemainingTime(timestamp) {
    const now = Date.now();
    // @ts-ignore
    const sec = Math.floor(((timestamp - now) / 1000) % 60).minDigits(2);
    // @ts-ignore
    const min = Math.floor((timestamp - now) / (1000 * 60)).minDigits(2);
    return `${min}:${sec}`;
  }

  function removeListener() {
    window.removeEventListener('session:success', sessionSuccessHandler);
    window.removeEventListener('session:error', sessionErrorHandler);
    window.removeEventListener('session:stop', sessionStopHandler);
    window.removeEventListener('session:extend', sessionExtendHandler);
    window.removeEventListener('video:save', videoSaveHandler);
    window.removeEventListener('video:delete', videoDeleteHandler);
    window.removeEventListener('user:save', userSaveHandler);
    window.removeEventListener('user:delete', userDeleteHandler);
  }

  async function loadConfig() {
    return await fetch('/config', { method: 'GET' })
      .then(async (res) => {
        if (res.ok) return await res.json();
      })
      .then((res) => {
        settings.update(parseConfigData(res));
      })
      .catch((reason) => console.error(reason));
  }

  function removeClasses() {
    root.classList.remove('ismobile');
  }

  /**
   * Saves video changes
   * @param {CustomEvent} param0
   */
  async function videoSaveHandler({ detail }) {
    const { data, show, onsuccess, onerror } = detail;
    const res = await fetch(`/videos/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(async (res) => {
      if (res.ok) return await res.json();
    });

    if (res?.success) {
      videos.put(data);
      onsuccess?.(res);
    } else {
      onerror?.(res);
    }

    if (show) {
      let message = res.message || res.data.message;
      configSnackbar(message);
      snackbar?.open();
    }
  }

  /**
   * Deletes a video
   * @param {CustomEvent} param0
   */
  async function videoDeleteHandler({ detail }) {
    const { data, show, onsuccess, onerror } = detail;
    const res = await fetch(`/videos/${data.id}`, { method: 'DELETE' }).then(async (res) => {
      if (res.ok) return await res.json();
    });

    if (res?.success) {
      urls.del(data.id);
      videos.del(data.id);
      onsuccess?.(res);
    } else {
      onerror?.(res);
    }

    if (show) {
      let message = res.message || res.data.message;
      configSnackbar(message);
      snackbar?.open();
    }
  }

  /**
   * Saves changes to user data
   * @param {CustomEvent} param0
   */
  async function userSaveHandler({ detail }) {
    const { data, onsuccess, onerror } = detail;
    const res = await fetch(`/users/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(async (res) => {
      if (res.ok) return await res.json();
    });

    if (res.success) {
      users.put(res.data);
      onsuccess?.(res);
    } else {
      onerror?.(res);
    }
  }

  /**
   * Deletes a user
   * @param {CustomEvent} param0
   */
  async function userDeleteHandler({ detail }) {
    const { id, onsuccess, onerror } = detail;
    const res = await fetch(`/users/${id}`, {
      method: 'DELETE'
    }).then(async (res) => {
      if (res.ok) return await res.json();
    });

    if (res?.success) {
      users.del(id);
      onsuccess?.(res);
    } else {
      onerror?.(res);
    }
  }
  /**
   *
   * @param {string} msg
   * @param {any=} link
   */
  function configSnackbar(msg, link) {
    try {
      snackbar?.close();
    } catch (e) {}
    configureAction(msg, link);
  }

  /**
   *
   * @param {string} msg
   * @param {({actionLink: string, actionLabel: string} | string)} link
   */
  function configureAction(msg = '', link) {
    actionLabel = void 0;
    actionLink = void 0;
    snackbarMessage = msg;
    if (typeof link === 'object') {
      actionLabel = link.actionLabel;
      actionLink = link.actionLink;
    } else {
      actionLink = link;
    }
  }

  function handleSnackbarOpened() {
    if (!actionLabel && actionLink) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => goto(actionLink), redirectDelay);
    }
  }

  function handleSnackbarClosed() {}

  /**
   *
   * @param {CustomEvent} event
   */
  async function sessionSuccessHandler({ detail }) {
    /**
     * @type {{user: import('$lib/types').User, renewed: string, message: string}}
     */
    const { user, renewed, message } = { ...detail };
    proxyEvent('session:extend', { start: true });
    flash.update({ message, type: 'success', timeout: 2000 });

    renewed && localStorage.setItem('renewed', renewed);
    configSnackbar(
      $_('text.external-login-welcome-message', {
        values: { name: user.name }
      })
    );
    snackbar?.open();
  }

  /**
   *
   * @param {CustomEvent} event
   */
  async function sessionExtendHandler({ detail }) {
    if (!$session.user && !detail.start) return;
    await tick();
    const { lifetime } = $settings.Session;
    const time = new Date(Date.now() + parseLifetime(lifetime)).toISOString();
    await post('/session/extend', time);
    if (detail.start) {
      PAGINATORS.clear();
      if (!$navigating) await invalidateAll();
    } else {
      if (!$navigating) await invalidate('app:session');
    }
    detail.callback?.();
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function sessionErrorHandler({ detail }) {
    const data = { ...detail };
    invalidate('app:session');
    flash.update({ ...data, type: 'error', timeout: 3500 });
    if (data.redirect) {
      setTimeout(async () => await goto(data.redirect), 3000);
    }
  }

  /**
   *
   * @param {CustomEvent} event
   */
  async function sessionStopHandler({ detail }) {
    await killSession();
    const path = detail.redirect ?? '/';
    const search = createRedirectSlug($page.url);

    invalidate('app:session');
    setTimeout(async () => await goto(`${path}?${search}`), 500);
  }

  async function killSession() {
    return await post('/auth/logout').then((res) => {
      snackbarMessage = res.message || res.data?.message;

      configSnackbar(snackbarMessage);
      snackbar?.open();
      return res;
    });
  }

  /**
   *
   * @param {CustomEvent} param0
   */
  function changedLocaleHandler({ detail }) {
    proxyEvent('session:extend');

    /** @type {any} */
    const { locale } = { ...detail };
    configSnackbar($_('text.language_is_now', { values: { locale } }));
    snackbar?.open();
  }

  /**
   * @param {{ section: string; key: string; }} setting
   */
  function isEditable({ section, key }) {
    let editableSection = editableSettings.get(section);
    if (Array.isArray(editableSection)) {
      return !!editableSection.find((item) => item === key);
    } else {
      return editableSection === key;
    }
  }

  /**
   * @param {MouseEvent} event
   * @param {any} id
   */
  function makeEditable(event, id) {
    // Todo
  }

  /**
   *
   * @param {string | void} color
   */
  function printCopyright(color) {
    color = color || '#ad1457';
    -1 < navigator.userAgent.toLowerCase().indexOf('chrome')
      ? window.console.log.apply(console, [
          '%c %c  Axel Nitzschner - Immersive Studio  %c %c  https://vod-app.vercel.app %c ',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #eee; color: #e2370f; padding:5px 0; margin:3px 0 10px 0;',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #eee; color: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;'
        ])
      : window.console &&
        window.console.log('Axel Nitzschner - Immersive Studio - https://vod-app.vercel.app');
  }
</script>

<Icons />

{#if $locale}
  <Modal header={{ name: 'text.upload-type' }} key="default-modal">
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={base} class="transition opacity-0">
        <form
          use:enhance={({ action, cancel }) => {
            const actionParam = new URLSearchParams(action.searchParams)
              .keys()
              .next()
              .value?.replace(/\//, '');
            if (!actionParam) cancel();
            return /** @param {{result: import('@sveltejs/kit').ActionResult | any}} param */ async ({
              result
            }) => {
              if (actionParam === 'reload') {
                if (result.type === 'success') {
                  settings.update(parseConfigData(result.data));
                  invalidate('app:session');
                }
              }
              if (actionParam === 'logout') {
                loggedInButtonTextSecondLine = $_('text.one-moment');
                if ((result.type = 'success')) {
                  proxyEvent('session:stop', { ...result.data, redirect: '/login' });
                }
              }
            };
          }}
          method="POST"
          class="main-menu login-form"
        >
          <Nav segment={$segment} {page} {logo}>
            {#if $session.user}
              <NavItem href="/videos" title="Videothek" segment="videos">
                <Icon class="material-icons" style="vertical-align: middle;">video_library</Icon>
                <Label>{$_('nav.library')}</Label>
              </NavItem>
            {/if}

            {#if hasPrivileges}
              <NavItem
                href={`/users/${$session.user?.id}${createTabSearch(
                  $settings.Site.defaultUserTab
                )}`}
                title="Administration"
                segment="users"
              >
                <Icon class="material-icons" style="vertical-align: middle;">settings</Icon>
                <Label>Admin</Label>
              </NavItem>
            {/if}

            {#if $session.user}
              <NavItem segment="login" class="hide-if-mobile">
                <Button
                  variant="raised"
                  class="sign-in-out button-logout v-emph v-emph-bounce {emphasize}"
                  formaction="/auth?/logout"
                  on:mouseenter={() => (emphasize = 'v-emph-active')}
                  on:mouseleave={() => (emphasize = '')}
                >
                  <Label class="first-line v-emph-primary v-emph-down">
                    <Icon
                      class="material-icons"
                      style="vertical-align: middle; font-size: 0.6rem; line-height: 1rem; margin-right: 0 !important;
                      opacity: .8;">logout</Icon
                    >
                    Logout
                  </Label>
                  <Label class="second-line v-emph-secondary v-emph-up">
                    {@html loggedInButtonTextSecondLine}
                  </Label>
                </Button>
              </NavItem>
            {:else}
              <NavItem
                href="/login{search}"
                class="sign-in-out-item hide-if-mobile"
                segment="login"
              >
                <Button variant="raised" class="sign-in-out" style="font">
                  <Label>{$_('nav.login')}</Label>
                  <Icon class="material-icons" style="vertical-align: middle;">login</Icon>
                </Button>
              </NavItem>
            {/if}

            {#if $session.user}
              <NavItem title="Avatar" href="/users/{$session.user?.id}?tab=profile">
                <UserGraphic
                  size="40"
                  borderSize="3"
                  borderColor="--primary"
                  dense
                  user={$session.user}
                  badge={{
                    icon: 'settings',
                    color: '--primary',
                    size: 'small',
                    position: 'BOTTOM_RIGHT'
                  }}
                />
              </NavItem>
            {:else}
              <NavItem title="Avatar" class="hide-if-mobile">
                <UserGraphic
                  borderSize="3"
                  borderColor="--primary"
                  dense
                  size="40"
                  fallback={person}
                />
              </NavItem>
            {/if}

            <NavItem title={$_('text.choose-locale')}>
              <LocaleSwitcher on:changed:locale={changedLocaleHandler} />
            </NavItem>

            {#if $session.user}
              <NavItem title="Logout" class="hide-if-desktop" segment="login">
                <Button>
                  <Label style="text-transform: none; letter-spacing: initial;"
                    >Logout
                    <Icon class="material-icons">logout</Icon></Label
                  >
                </Button>
              </NavItem>
            {:else}
              <NavItem
                href="/login{search}"
                title="Logout"
                class="hide-if-desktop"
                segment="logout"
              >
                <Icon class="material-icons" style="vertical-align: middle;">login</Icon>
                <Label>Login</Label>
              </NavItem>
            {/if}

            <NavItem title={$_('text.more-dots')} class="hide-if-mobile">
              <MoreMenu labelSize="1em" iconSize="18px">
                <FrameworkSwitcher />
                <Separator />
                <Item class="justify-start">
                  <Button
                    href={$frameworks.href}
                    target="_blank"
                    class="link-button"
                    ripple={false}
                  >
                    <span style="display: flex; flex: 1 0 100%; align-items: center">
                      <SvgIcon name="github" class="mr-2" />
                      <Label>GitHub</Label>
                    </span>
                  </Button>
                </Item>
                <Separator />
                {#if $session.role === SUPERUSER}
                  <Item class="justify-start">
                    <Button formaction="/config?/reload" class="link-button" ripple={false}>
                      <SvgIcon name="sync" class="mr-2" fillColor="#000" />
                      <Label>Reload Config</Label>
                    </Button>
                  </Item>
                  <Separator />
                {/if}
                <Item class="justify-start">
                  <Button
                    href={`${$page.url.pathname}${buildSearchParams($page.url.searchParams, {
                      addableKeys: [['modal', 'settings']]
                    })}`}
                    class="link-button"
                    ripple={false}
                  >
                    <Icon class="material-icons mr-2">settings</Icon>
                    <Label style="">Settings</Label>
                  </Button>
                </Item>
              </MoreMenu>
            </NavItem>
          </Nav>
        </form>
        <slot />
      </div>
    </Modal>
  </Modal>
{/if}
<LoadingModal backgroundColor="#ffffff" opacity={loaderBackgroundOpacity} wait={1000}>
  <DoubleBounce color={loaderColor} unit="px" size="200" />
</LoadingModal>
<Dialog
  bind:this={settingsDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={async () =>
    await goto(
      `${$page.url.pathname}${buildSearchParams($page.url.searchParams, {
        removableKeys: ['modal', 'edit']
      })}`
    )}
>
  <DialogTitle id="info-title">{$_('text.settings')}</DialogTitle>
  <Content>
    <div class="settings-list">
      <ul class="level-1">
        {#each Object.entries($settings).sort() as setting}
          <li>
            <div class="settings-headline">{$_(setting[0])}</div>
            <span>
              <ul class="level-2">
                {#if setting[1] instanceof Object}
                  {#each Object.entries(setting[1]) as item}
                    <li class:editable-list={isEditable({ section: setting[0], key: item[0] })}>
                      <span class="key">
                        <strong>{item[0]}</strong>
                      </span>
                      <span
                        class:editable={isEditable({ section: setting[0], key: item[0] })}
                        contenteditable="false"
                        class="val editable">{item[1]}</span
                      >
                      {#if isEditable({ section: setting[0], key: item[0] })}
                        <!-- Todo -->
                        <span class="hidden">
                          <a
                            class="edit"
                            on:click|preventDefault={(event) =>
                              makeEditable(event, `${setting[0]}:${item[0]}`)}
                            href={`${$page.url.pathname}${buildSearchParams(
                              $page.url.searchParams,
                              {
                                addableKeys: [['edit', `${setting[0]}:${item[0]}`]]
                              }
                            )}`}>edit</a
                          >
                        </span>
                      {/if}
                    </li>
                  {/each}
                {/if}
              </ul>
            </span>
          </li>
        {/each}
      </ul>
    </div>
  </Content>
  <DialogActions>
    <Button action="none" variant="unelevated">
      <Label>{$_('text.close')}</Label>
    </Button>
  </DialogActions>
</Dialog>

<Snackbar
  style="z-index: 1001;"
  bind:this={snackbar}
  snackbarLifetimeMs={snackbarLifetime}
  labelText={snackbarMessage}
  on:MDCSnackbar:opened={handleSnackbarOpened}
  on:MDCSnackbar:closed={handleSnackbarClosed}
>
  <Label />
  <SnackbarActions>
    {#if actionLabel}
      <a href={actionLink}>{actionLabel}</a>
    {/if}
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </SnackbarActions>
</Snackbar>

<style>
  .transition {
    transition: all 0.4s ease-in;
  }
  :global(.home .grid-inner) {
    display: inline-block;
  }
  :global(.is-login-page .sign-in-out-item a) {
    pointer-events: none;
  }
  .settings-list .level-1 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'one two';
    font-size: 0.8em;
    font-weight: 600;
  }
  .settings-list .level-1 > li {
    padding: 8px;
  }
  .settings-list .level-1 > li div {
    margin-bottom: 10px;
  }
  .settings-list .level-2 li {
    display: grid;
    grid-template-areas: 'one two';
    grid-template-columns: 2fr 3fr;
    position: relative;
    font-size: 0.8em;
    font-weight: 400;
  }
  .settings-list .level-2 li.editable-list {
    grid-template-areas: 'one two three';
    grid-template-columns: 2fr 1.5fr 1.5fr;
  }
  .settings-list .level-2 li.editable-list .edit {
    grid-area: three;
  }
  .level-2 span {
    padding-left: 10px;
  }
  .level-2 .key {
    grid-area: one;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
  .level-2 .val {
    grid-area: two;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .settings-headline {
    border-bottom: 1px solid var(--text-light);
    border-left: 1px solid var(--text-light);
    padding-left: 5px;
    margin-bottom: 10px;
  }
</style>
