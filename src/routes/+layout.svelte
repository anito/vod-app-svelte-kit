<script>
  // @ts-nocheck

  import '../app.css';
  import '$lib/components/_notched_outline.scss';
  import '$lib/components/_colored_snackbar.scss';
  import * as api from '$lib/api';
  import { writable } from 'svelte/store';
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import { getContext, onMount, setContext } from 'svelte';
  import isMobile from 'ismobilejs';
  import { Icons } from '$lib/components';
  import Button, { Icon } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Snackbar, { Actions } from '@smui/snackbar';
  import { Label } from '@smui/common';
  import {
    createRedirectSlug,
    createTabSearch,
    get,
    post,
    proxyEvent,
    svg,
    ADMIN,
    SUPERUSER,
    processRedirect
  } from '$lib/utils';
  import {
    fabs,
    flash,
    settings,
    session,
    theme,
    ticker,
    urls,
    videos,
    videoEmitter
  } from '$lib/stores';
  import { Modal } from '$lib/components';
  import { DoubleBounce } from 'svelte-loading-spinners';
  import {
    UserGraphic,
    LoadingModal,
    LocaleSwitcher,
    FrameworkSwitcher,
    Nav,
    NavItem
  } from '$lib/components';
  import { svg_manifest } from '$lib/svg_manifest';
  import { _, locale } from 'svelte-i18n';

  /** @type {import('./$types').PageData} */
  export let data;

  const snackbarLifetimeDefault = 4000;
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
  let message = '';
  /**
   * @type {string}
   */
  let action = '';
  /**
   * @type {string}
   */
  let path = '';
  /**
   * @type {ReturnType<typeof setTimeout>}
   */
  let timeoutId;
  /**
   * @type {any}
   */
  let isMobileDevice;
  /**
   * @type {string}
   */
  let loggedInButtonTextSecondLine;
  /**
   * @type {import("svelte/store").Unsubscriber}
   */
  let unsubscribeVideoEmitter;
  /**
   * @type {string}
   */
  let emphasize;
  /**
   * @type {import("@smui/snackbar").SnackbarComponentDev}
   */
  let snackbar;
  /**
   * @type {number}
   */
  let loaderBackgroundOpacity = 1;
  /**
   * @type {string}
   */
  let loaderColor = 'var(--prime)';
  /**
   * @type {boolean}
   */
  let isMounted = false;
  /**
   * @type {boolean}
   */
  let configLoaded = false;

  setContext('fab', {
    setFab: (/** @type {any} */ name) => fabs.update(name),
    restoreFab: () => fabs.restore()
  });

  setContext('snackbar', {
    getSnackbar: () => snackbar,
    configSnackbar
  });

  const { getSnackbar } = getContext('snackbar');

  const mounted = writable(isMounted);

  ticker.subscribe((val) => {
    // console.log(
    //   '%c TICKER %c %s',
    //   'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
    //   'background: #ffff81; color: #000000; padding:4px 6px 3px 0;',
    //   `${(!isNaN(val) && parseInt(val / 1000) + 's') || '--'}`
    // );
    if (val === 0) {
      proxyEvent('ticker:stop');
    }
  });

  unsubscribeVideoEmitter = videoEmitter.subscribe((t) => {
    if ('put' === t.method) {
      put(t);
    }
    if ('del' === t.method) {
      del(t);
    }
  });

  setContext('mounted', {
    mounted
  });

  $: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
  $: token = $session.user?.jwt;
  $: person = svg(svg_manifest.person, $theme.primary);
  $: logo = svg(svg_manifest.logo_vod, $theme.primary);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: root && ((user) => root.classList.toggle('loggedin', user))(!!$session.user);
  $: root && ((isPrivileged) => root.classList.toggle('admin', isPrivileged))(hasPrivileges);
  $: ((seg) => {
    root && ((seg && root.classList.remove('home')) || (!seg && root.classList.add('home')));
  })(segment);
  $: isMobileDevice = isMobile.any;
  $: snackbarLifetime = action ? 6000 : snackbarLifetimeDefault;
  $: $session.user &&
    (loggedInButtonTextSecondLine = $_('text.logged-in-button-second-line', {
      values: { name: $session.user?.name }
    }));
  $: searchParams = $page.url.searchParams.toString();
  $: search = searchParams && `?${searchParams}`;
  $: configLoaded && checkSession();

  onMount(async () => {
    $mounted = true;
    root = document.documentElement;

    snackbar = getSnackbar();

    reveal();
    initListener();
    getConfig();
    initClasses();
    initStyles();

    return () => {
      removeListener();
      removeSubscribers();
      removeClasses();
    };
  });

  async function getConfig() {
    await get('/config').then((res) => {
      settings.update(res);
      configLoaded = true;
    });
  }

  function reveal() {
    setTimeout(() => {
      loaderBackgroundOpacity = 0.45;
      loaderColor = 'var(--flash)';
      base?.classList.remove('opacity-0');
    }, 400);
  }

  function initListener() {
    window.addEventListener('ticker:success', tickerSuccessHandler);
    window.addEventListener('ticker:error', tickerErrorHandler);
    window.addEventListener('ticker:stop', tickerStopHandler);
    window.addEventListener('ticker:extend', tickerExtendHandler);
  }

  function checkSession() {
    const { _expires } = { ...$session };
    if (!_expires) return;

    const valid = new Date() < new Date(_expires);
    if (valid) {
      proxyEvent('ticker:extend');
    } else {
      proxyEvent('ticker:stop', {
        redirect: '/login'
      });
    }
  }

  function initClasses() {
    isMobileDevice && root.classList.add('ismobile');
  }

  function initStyles() {
    let styles = window.getComputedStyle(root);
    theme.set({
      primary: styles.getPropertyValue('--prime'),
      secondary: styles.getPropertyValue('--second')
    });
  }

  function displayRemainingTime(timestamp) {
    const now = Date.now();
    const sec = Math.floor(((timestamp - now) / 1000) % 60).minDigits(2);
    const min = Math.floor((timestamp - now) / (1000 * 60)).minDigits(2);
    return `${min}:${sec}`;
  }

  function removeListener() {
    window.removeEventListener('ticker:success', tickerSuccessHandler);
    window.removeEventListener('ticker:error', tickerErrorHandler);
    window.removeEventListener('ticker:stop', tickerStopHandler);
    window.removeEventListener('ticker:extend', tickerExtendHandler);
  }

  function removeSubscribers() {
    unsubscribeVideoEmitter();
  }

  function removeClasses() {
    root.classList.remove('ismobile');
  }

  /**
   * Saves video changes
   * @param {import('$lib/types').VideoEmitter} VideoEmitterData
   */
  async function put({ data, show }) {
    await api.put(`videos/${data.id}`, { data, token: $session.user?.jwt }).then((res) => {
      res.success && videos.put(data);

      if (show) {
        let message = res.message || res.data.message;
        configSnackbar(message);
        snackbar.open();
      }
    });
  }

  /**
   * Deletes a video
   * @param {import('$lib/types').VideoEmitter} VideoEmitterData
   */
  async function del({ data, show }) {
    await api.del(`videos/${data.id}`, { token }).then((res) => {
      if (res.success) {
        urls.del(data.id);
        videos.del(data.id);
      }

      if (show) {
        let message = res.message || res.data.message;
        configSnackbar(message);
        snackbar.open();
      }
    });
  }

  async function submit(node) {
    let submitting = false;

    async function submitHandler(e) {
      e.preventDefault();

      loggedInButtonTextSecondLine = $_('text.one-moment');

      const form = e.target;
      const data = {};

      if (submitting) return;
      submitting = true;

      // new FormData(form).forEach((value, key) => (data[key] = value));
      await post(form.action, {}).then(async (res) => {
        const { success, data } = { ...res };

        if (success) {
          proxyEvent('ticker:stop', { ...data });
        }
        submitting = false;
      });
    }

    node.addEventListener('submit', submitHandler);

    return () => node.removeEventListener('submit', submitHandler);
  }

  function configSnackbar(msg, link) {
    try {
      snackbar.close();
    } catch (e) {}
    configureAction(msg, link);
  }

  function configureAction(msg = '', link) {
    message = msg;
    action = path = '';
    if (typeof link === 'object') {
      path = link.path;
      action = link.action;
    } else {
      path = link;
    }
  }

  function handleSnackbarOpened() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => !action && path && goto(path), redirectDelay);
  }

  function handleSnackbarClosed() {}

  async function tickerSuccessHandler(ev) {
    const { user, renewed, message } = { ...ev.detail };
    invalidate('/session');
    flash.update({ message, type: 'success', timeout: 2000 });

    renewed && localStorage.setItem('renewed', renewed);
    configSnackbar(
      $_('text.external-login-welcome-message', {
        values: { name: user.name }
      })
    );
    snackbar?.open();
  }

  async function tickerErrorHandler(ev) {
    const data = { ...ev.detail };
    invalidate('/session');
    flash.update({ ...data, type: 'error', timeout: 3000 });
  }

  async function tickerStopHandler(ev) {
    if (!$session.user) return;
    await killSession().then(() => {
      const path = ev.detail.redirect || '/';
      const search = createRedirectSlug($page.url);
      goto(`${path}${search}`);
    });
  }

  async function killSession() {
    return await post(`/auth/logout`, {}).then(async (res) => {
      invalidate('/session');
      message = res.message || res.data?.message;

      configSnackbar(message);
      snackbar = getSnackbar();
      snackbar?.open();

      return res.success;
    });
  }

  async function tickerExtendHandler() {
    if ($session.user) {
      await post(
        '/session/extend',
        new Date(Date.now() + parseInt($settings.Session.lifetime)).toISOString()
      );
      invalidate('/session');
    }
  }
</script>

<Icons />

{#if $locale}
  <Modal header={{ name: 'text.upload-type' }}>
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={base} class="transition opacity-0">
        <form use:submit class="main-menu login-form" method="POST" action="/auth/logout">
          <Nav {segment} {page} {logo}>
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
              <NavItem segment="login">
                <Button
                  variant="raised"
                  class="sign-in-out button-logout v-emph v-emph-bounce {emphasize}"
                  on:mouseenter={() => (emphasize = 'v-emph-active')}
                  on:mouseleave={() => (emphasize = '')}
                >
                  <span class="button-first-line v-emph-primary v-emph-down">Logout</span>
                  <Label class="no-break v-emph-secondary v-emph-up">
                    {@html loggedInButtonTextSecondLine}
                  </Label>
                </Button>
              </NavItem>
            {:else}
              <NavItem href="/login{search}" class="sign-in-out-item">
                <Button formaction="/logout" color="secondary" variant="raised" class="sign-in-out">
                  <Label>{$_('nav.login')}</Label>
                </Button>
              </NavItem>
            {/if}

            {#if $session.user}
              <NavItem title="Avatar" href="/users/{$session.user?.id}?tab=profile">
                <UserGraphic
                  borderSize="3"
                  borderColor="--prime"
                  dense
                  size="40"
                  user={$session.user}
                  badge={{
                    icon: 'settings',
                    color: '--prime',
                    size: 'small',
                    position: 'BOTTOM_RIGHT'
                  }}
                />
              </NavItem>
            {:else}
              <NavItem title="Avatar">
                <UserGraphic
                  borderSize="3"
                  borderColor="--prime"
                  dense
                  size="40"
                  fallback={person}
                />
              </NavItem>
            {/if}

            <NavItem title={$_('text.choose-locale')}>
              <LocaleSwitcher />
            </NavItem>

            <NavItem title={$_('text.choose-framework')} style="vertical-align: middle;">
              <FrameworkSwitcher />
            </NavItem>
          </Nav>
        </form>
        <slot />
      </div>
    </Modal>
  </Modal>
{/if}
<LoadingModal backgroundColor="#ffffff" opacity={loaderBackgroundOpacity} wait="350">
  <DoubleBounce color={loaderColor} unit="px" size="200" />
</LoadingModal>

<Snackbar
  style="z-index: 1001;"
  bind:this={snackbar}
  snackbarLifetimeMs={snackbarLifetime}
  labelText={message}
  on:MDCSnackbar:closed={handleSnackbarClosed}
  on:MDCSnackbar:opened={handleSnackbarOpened}
>
  <Label />
  <Actions>
    {#if action}
      <Button on:click={() => goto(path)}>{action}</Button>
    {/if}
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>

<style>
  .transition {
    transition: all 0.4s ease-in;
  }
  .button-first-line {
    position: absolute;
    width: 84%;
    text-overflow: ellipsis;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
  }
  :global(.home .grid-inner) {
    display: inline-block;
  }
  :global(.is-login-page .sign-in-out-item a) {
    pointer-events: none;
  }
  :global(button.sign-in-out) {
    height: 74px;
    width: 130px;
  }
  :global(.is-login-page button.sign-in-out) {
    transform: translateY(-60px);
    transition: all 0.4s ease-out;
  }
  :global(button.sign-in-out) {
    transform: translateY(0px);
    transition: all 0.4s ease-in;
  }
  :global(button .no-break) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :global(button.sign-in-out) {
    transition: all 0.4s ease-in;
    opacity: 1;
  }
  :global(.signing-in button.sign-in-out) {
    pointer-events: none;
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
