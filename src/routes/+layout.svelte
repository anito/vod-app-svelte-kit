<script>
  import '../app.css';
  import '$lib/components/_button.scss';
  import '$lib/components/_notched_outline.scss';
  import '$lib/components/_colored_snackbar.scss';
  import * as api from '$lib/api';
  import { derived, writable } from 'svelte/store';
  import { afterNavigate, goto, invalidate, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { getContext, onMount, setContext } from 'svelte';
  import isMobile from 'ismobilejs';
  import { Icons } from '$lib/components';
  import Button, { Icon } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import { Item, Separator, Text } from '@smui/list';
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
    randomItem,
    afterOrBeforeNavigation,
    parseLifetime
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
    videoEmitter
  } from '$lib/stores';
  import { Modal, SvgIcon } from '$lib/components';
  import { DoubleBounce } from 'svelte-loading-spinners';
  import {
    UserGraphic,
    LoadingModal,
    LocaleSwitcher,
    MoreMenu,
    FrameworkSwitcher,
    Nav,
    NavItem
  } from '$lib/components';
  import { svg_manifest } from '$lib/svg_manifest';
  import { _, locale } from 'svelte-i18n';
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';

  /** @type {import('./$types').LayoutData} */
  export let data;

  const snackbarLifetime = 4000;
  const redirectDelay = 300;

  /**
   * @type {any}
   */
  let oldConfig;
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
      proxyEvent('session:stop');
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

  const { getSegment } = getContext('segment');
  const segment = getSegment();

  salutation.update(randomItem(data.config?.Site?.salutations) || 'Hi');

  $: settings.update(data.config);
  $: token = $session.user?.jwt;
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
  $: withConfig = () => {
    const configSearchParams = new URLSearchParams($page.url.searchParams);
    configSearchParams.set('config', 'load');
    return `?${configSearchParams.toString()}`;
  };
  $: $page.url.searchParams.has('config') && configLoadReset();

  onMount(async () => {
    $mounted = true;
    root = document.documentElement;

    snackbar = getSnackbar();

    reveal();
    initListener();
    checkSession();
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
      proxyEvent('session:success', $session);
    } else {
      proxyEvent('session:stop', {
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
    window.addEventListener('session:success', sessionSuccessHandler);
    window.addEventListener('session:error', sessionErrorHandler);
    window.addEventListener('session:stop', sessionStopHandler);
    window.addEventListener('session:extend', sessionExtendHandler);
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
      res?.success && videos.put(data);

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
      if (res?.success) {
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
   *
   * @param {string} msg
   * @param {any=} link
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

    const { lifetime } = $settings.Session;
    const time = new Date(Date.now() + parseLifetime(lifetime)).toISOString();
    await post('/session/extend', time);
    if (detail.start) {
      invalidateAll();
    } else {
      await invalidate('app:session');
    }
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
      snackbar = getSnackbar();
      snackbar?.open();
      return res;
    });
  }

  async function configLoadReset() {
    if (!browser) return;

    configSnackbar($_('text.config-reloaded'));
    snackbar?.open();

    $page.url.searchParams.delete('config');
    setTimeout(async () => await goto($page.url.href), 500);
  }

  /**
   *
   * @param {string | any} hit
   */
  const navigationCallback = (hit) => {
    if (!hit) {
      clearTimeout(navTimeoutId);
      navTimeoutId = setTimeout(() => {
        proxyEvent('session:extend');
      }, 1500);
    }
  };

  afterOrBeforeNavigation(
    afterNavigate,
    {
      to_searches: [['config', 'load']],
      from_pathnames: ['login'],
      to_pathnames: ['auth?/logout', 'auth?/login', 'login', 'logout', 'config']
    },
    navigationCallback
  );

  /**
   *
   * @param {CustomEvent} param0
   */
  function changedLocaleHandler({ detail }) {
    proxyEvent('session:extend');

    /** @type {any} */
    const { locale } = { ...detail };
    configSnackbar($_('text.language_is_now', { values: { locale } }));
    snackbar.open();
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
  <Modal header={{ name: 'text.upload-type' }} key="default-modal">
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={base} class="transition opacity-0">
        <form
          use:enhance={() => {
            loggedInButtonTextSecondLine = $_('text.one-moment');
            return /** @param {{result: import('@sveltejs/kit').ActionResult | any}} param */ ({
              result
            }) => {
              if ((result.type = 'success')) {
                proxyEvent('session:stop', { ...result.data, redirect: '/login' });
              }
            };
          }}
          class="main-menu login-form"
          action="/auth?/logout"
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

            <NavItem title={$_('text.more')} style="vertical-align: middle;" class="hide-if-mobile">
              <MoreMenu>
                <FrameworkSwitcher />
                <Separator />
                <Item class="justify-start">
                  <a
                    class="github"
                    href={$frameworks.href}
                    target={$frameworks.target}
                    title={$_('text.goto-github')}
                  >
                    <span style="display: flex; align-items: center;">
                      <SvgIcon name="github" class="mr-2" style="max-width: 20%;" />
                      <Text style="max-width: 80%;">GitHub</Text>
                    </span>
                  </a>
                </Item>
                <Separator />
                <Item class="justify-start">
                  <a href={`${$page.url.pathname}${withConfig()}`} title={$_('text.reload-config')}>
                    <span style="display: flex; align-items: center;">
                      <SvgIcon name="sync" class="mr-2" fillColor="#000" style="max-width: 20%;" />
                      <Text style="max-width: 80%;">Rel.Config</Text>
                    </span>
                  </a>
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
<LoadingModal backgroundColor="#ffffff" opacity={loaderBackgroundOpacity} wait={2000}>
  <DoubleBounce color={loaderColor} unit="px" size="200" />
</LoadingModal>

<Snackbar
  style="z-index: 1001;"
  bind:this={snackbar}
  snackbarLifetimeMs={snackbarLifetime}
  labelText={snackbarMessage}
  on:MDCSnackbar:opened={handleSnackbarOpened}
  on:MDCSnackbar:closed={handleSnackbarClosed}
>
  <Label />
  <Actions>
    {#if actionLabel}
      <a href={actionLink}>{actionLabel}</a>
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
