<script>
  import '../app.css';
  import '$lib/components/_button.scss';
  import '$lib/components/_notched_outline.scss';
  import '$lib/components/_colored_snackbar.scss';
  import * as api from '$lib/api';
  import { writable } from 'svelte/store';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { getContext, onMount, setContext, tick } from 'svelte';
  import isMobile from 'ismobilejs';
  import { Icons } from '$lib/components';
  import Button, { Icon } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Snackbar, { Actions } from '@smui/snackbar';
  import { Label } from '@smui/common';
  import {
    createRedirectSlug,
    createTabSearch,
    post,
    proxyEvent,
    svg,
    ADMIN,
    SUPERUSER,
    getSegment,
    randomItem
  } from '$lib/utils';
  import {
    fabs,
    flash,
    salutation,
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

  /** @type {import('./$types').LayoutData} */
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
   * @type {ReturnType<typeof setInterval>}
   */
  let pollId;
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
  let loaderColor = 'var(--primary)';
  /**
   * @type {boolean}
   */
  let isMounted = false;

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
    // log(
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

  settings.update(data.config);

  $: segment = getSegment($page);
  $: token = $session.user?.jwt;
  $: person = svg(svg_manifest.person, $theme.primary);
  $: logo = svg(svg_manifest.logo_vod, $theme.primary);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: root && ((user) => root.classList.toggle('loggedin', user))(!!$session.user);
  $: root && ((isPrivileged) => root.classList.toggle('admin', isPrivileged))(hasPrivileges);
  $: ((seg) => {
    root && ((seg && root.classList.remove('home')) || (!seg && root.classList.add('home')));
  })(segment);
  $: snackbarLifetime = action ? 6000 : snackbarLifetimeDefault;
  $: salutation.update(randomItem(data.config.Site.salutations));
  $: if ($session.user) {
    loggedInButtonTextSecondLine = `${$salutation}, ${$session.user.name}`;
  }
  $: searchParams = $page.url.searchParams.toString();
  $: search = searchParams && `?${searchParams}`;

  onMount(async () => {
    $mounted = true;
    root = document.documentElement;

    snackbar = getSnackbar();

    checkSession();
    reveal();
    initListener();
    initClasses();
    initStyles();
    startPolling();
    printCopyright();

    return () => {
      removeListener();
      removeSubscribers();
      removeClasses();
    };
  });

  async function checkSession() {
    const { user, _expires, fromToken } = { ...$session };
    if (!user || fromToken) return;

    const valid = new Date() < new Date(_expires);
    if (valid) {
      proxyEvent('ticker:success', $session);
    } else {
      proxyEvent('ticker:stop', {
        redirect: `/login`
      });
    }
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
        snackbar?.open();
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
        snackbar?.open();
      }
    });
  }

  /**
   * @this {{ "on:submit": () => Promise<void>; class: string; method: string; action: string; }}
   */
  async function submitHandler() {
    loggedInButtonTextSecondLine = $_('text.one-moment');
    const form = this;
    await post(form.action, {})
      .then((res) => {
        /**
         * @type {{success: boolean, data: any}}
         */
        const { success, data } = { ...res };

        if (success) {
          proxyEvent('ticker:stop', { ...data });
        }
      })
      .catch((reason) => console.error(reason));
  }

  /**
   *
   * @param {string} msg
   * @param {string | void} link
   */
  function configSnackbar(msg, link) {
    try {
      snackbar.close();
    } catch (e) {}
    configureAction(msg, link);
  }

  /**
   *
   * @param {string} msg
   * @param {any} link
   */
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

  /**
   *
   * @param {CustomEvent} event
   */
  async function tickerSuccessHandler(event) {
    /**
     * @type {{user: import('$lib/types').User, renewed: string, message: string}}
     */
    const { user, renewed, message } = { ...event.detail };
    proxyEvent('ticker:extend', { start: true });
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
  async function tickerExtendHandler(event) {
    const time = new Date(Date.now() + parseInt($settings.Session.lifetime)).toISOString();
    await post('/session/extend', time);
    await invalidate('app:session').then(async () => {
      if (event.detail.start) {
        if ($page.route.id?.startsWith('/users')) await invalidate('app:users');
        if ($page.route.id?.startsWith('/videos')) await invalidate('app:videos');
      }
    });
  }

  /**
   *
   * @param {CustomEvent} event
   */
  function tickerErrorHandler(event) {
    const data = { ...event.detail };
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
  async function tickerStopHandler(event) {
    await killSession();
    const path = event.detail.redirect ?? '/';
    const search = createRedirectSlug($page.url);
    await goto(`${path}${search}`);

    invalidate('app:session');
  }

  async function killSession() {
    return await post('/auth/logout').then((res) => {
      message = res.message || res.data?.message;

      configSnackbar(message);
      snackbar = getSnackbar();
      snackbar?.open();
      return res;
    });
  }

  /**
   *
   * @param {string | void} color
   */
  function printCopyright(color) {
    color = color || '#ad1457';
    -1 < navigator.userAgent.toLowerCase().indexOf('chrome')
      ? window.console.log.apply(console, [
          '%c %c  Axel Nitzschner - Immersive Studio  %c %c  http://vod-app.vercel.app %c ',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #eee; color: #e2370f; padding:5px 0; margin:3px 0 10px 0;',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #eee; color: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;'
        ])
      : window.console &&
        window.console.log('Axel Nitzschner - Immersive Studio - http://vod-app.vercel.app');
  }
</script>

<Icons />

{#if $locale}
  <Modal header={{ name: 'text.upload-type' }}>
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={base} class="transition opacity-0">
        <form
          on:submit|preventDefault={submitHandler}
          class="main-menu login-form"
          method="POST"
          action="/auth/logout"
        >
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
              <NavItem href="/login{search}" class="sign-in-out-item">
                <Button variant="raised" class="sign-in-out">
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
              <NavItem title="Avatar">
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
<LoadingModal backgroundColor="#ffffff" opacity={loaderBackgroundOpacity} wait={350}>
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
  :global(.home .grid-inner) {
    display: inline-block;
  }
  :global(.is-login-page .sign-in-out-item a) {
    pointer-events: none;
  }
</style>
