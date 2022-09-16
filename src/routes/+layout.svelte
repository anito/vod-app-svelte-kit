<script>
  // @ts-nocheck

  import '../app.css';
  import '$lib/components/_notched_outline.scss';
  import * as api from '$lib/api';
  import { goto, invalidate, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { getContext, onMount, setContext } from 'svelte';
  import isMobile from 'ismobilejs';
  import { Icons } from '$lib/components';
  import Button, { Icon } from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Snackbar, { Actions } from '@smui/snackbar';
  import { Label } from '@smui/common';
  import {
    del as logout,
    createRedirectSlug,
    proxyEvent,
    svg,
    __ticker__,
    ADMIN,
    SUPERUSER,
    post,
    createTabSearch
  } from '$lib/utils';
  import {
    fabs,
    settings,
    session,
    theme,
    ticker,
    urls,
    videos,
    videoEmitter,
    sessionCookie
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
  import { writable } from 'svelte/store';

  export let data;

  const snackbarLifetimeDefault = 4000;
  const redirectDelay = 300;

  let root;
  let base;
  let message = '';
  let action = '';
  let path = '';
  let timeoutId;
  let isMobileDevice;
  let loggedInButtonTextSecondLine;
  let unsubscribeVideoEmitter;
  let emphasize;
  let snackbar;
  let loaderBackgroundOpacity = 1;
  let loaderColor = 'var(--prime)';
  let isMounted = false;

  setContext('fab', {
    setFab: (name) => fabs.update(name),
    restoreFab: () => fabs.restore()
  });

  setContext('snackbar', {
    getSnackbar: () => snackbar,
    configSnackbar
  });

  const { getSnackbar } = getContext('snackbar');

  ticker.subscribe((val) => {
    // console.log(
    //   '%c TICKER %c %s',
    //   'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
    //   'background: #ffff81; color: #000000; padding:4px 6px 3px 0;',
    //   `${(!isNaN(val) && parseInt(val / 1000) + 's') || '--'}`
    // );
    if (val === 0) {
      proxyEvent('ticker:end');
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

  $: console.log('SESSION', $session);
  // $: console.log('DATA.SESSION +layout.svelte', data.session);
  // $: console.log('DATA.SESSION +layout.svelte $page (store)', $page.data.session);
  $: data && saveConfig(data.config);
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

  const mounted = writable(isMounted);

  setContext('mounted', {
    mounted
  });

  onMount(() => {
    $mounted = true;
    console.log('Layout mounted');
    root = document.documentElement;
    setTimeout(() => {
      loaderBackgroundOpacity = 0.45;
      loaderColor = 'var(--flash)';
      base.classList.remove('opacity-0');
    }, 200);

    snackbar = getSnackbar();

    initListener();
    initSession();
    initClasses();
    initStyles();

    return () => {
      removeListener();
      removeSubscribers();
      removeClasses();
    };
  });

  function initListener() {
    window.addEventListener('ticker:start', tickerStartHandler);
    window.addEventListener('ticker:end', tickerEndHandler);
    window.addEventListener('ticker:extend', tickerExtendHandler);
  }

  function initSession() {
    const now = Date.now();
    const { start } = { start: 0, ...$session };
    const { lifetime } = $settings.Session;
    const elapsed = now - new Date(start);
    const remaining = parseInt(lifetime) - elapsed;
    if (remaining > 0) {
      proxyEvent('ticker:extend', { remaining });
    } else {
      const pathname = $page.url.pathname;
      proxyEvent('ticker:end', {
        path: pathname == '/' ? pathname : '/login'
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

  function removeListener() {
    window.removeEventListener('ticker:start', tickerStartHandler);
    window.removeEventListener('ticker:end', tickerEndHandler);
    window.removeEventListener('ticker:extend', tickerExtendHandler);
  }

  function removeSubscribers() {
    unsubscribeVideoEmitter();
  }

  function removeClasses() {
    root.classList.remove('ismobile');
  }

  function saveConfig(config) {
    settings.update(config);
  }
  /**
   * Saves video changes and deletions
   * @param item
   */
  async function put({ data, show }) {
    await api.put(`videos/${data.id}`, { data, token: $session.user?.jwt }).then((res) => {
      res.success && videos.put(data);

      if (show) {
        let message = res.message || res.data.message;
        snackbar.isOpen && snackbar.close();
        configSnackbar(message);
        snackbar.open();
      }
    });
  }

  async function del({ data, show }) {
    await api.del(`videos/${data.id}`, { token }).then((res) => {
      if (res.success) {
        urls.del(data.id);
        videos.del(data.id);
      }

      if (show) {
        let message = res.message || res.data.message;
        snackbar.isOpen && snackbar.close();
        configSnackbar(message);
        snackbar.open();
      }
    });
  }

  function submit(e) {
    if ($session.user) {
      loggedInButtonTextSecondLine = $_('text.one-moment');
      proxyEvent('ticker:end');
    }
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

  function tickerStartHandler(e) {
    let { user, groups, renewed } = { ...e.detail };
    const { id, name, jwt, avatar, role } = { ...user };
    console.log('tickerStartHandler', name);

    invalidateAll();

    // sessionCookie.update({ user: { id, name, jwt, avatar }, role, groups });

    renewed && localStorage.setItem('renewed', renewed);
    configSnackbar(
      $_('text.external-login-welcome-message', {
        values: { name: user.name }
      })
    );
    snackbar?.open();
  }

  async function tickerEndHandler(e) {
    console.log('tickerEndHandler', $session.user);
    if ($session.user) {
      await killSession();
      const path = e.detail.path || '/';
      const redirect = createRedirectSlug($page.url);
      goto(`${path}${redirect}`);
    }
  }

  async function tickerExtendHandler() {
    if ($session.user) {
      const start = new Date().toISOString();
      const response = await post('/session/extend', start);
      invalidateAll();
      sessionCookie.update(response);
    }
  }

  async function killSession() {
    $sessionCookie.user = null;
    $sessionCookie.role = null;
    $sessionCookie.groups = null;

    invalidateAll();
    return await logout(`/auth/logout`).then(async (res) => {
      message = res.message || res.data?.message;

      configSnackbar(message);
      snackbar = getSnackbar();
      snackbar?.open();

      return res.success;
    });
  }
</script>

<Icons />

{#if $locale}
  <Modal header={{ name: 'text.upload-type' }}>
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={base} class="transition opacity-0">
        <form
          on:submit|preventDefault={submit}
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
<LoadingModal backgroundColor="#ffffff" opacity={loaderBackgroundOpacity} wait="100">
  <DoubleBounce color={loaderColor} unit="px" size="200" />
</LoadingModal>

<Snackbar
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