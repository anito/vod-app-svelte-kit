<script lang="ts">
  import 'assets/base.css';
  import 'assets/app.css';
  import '$lib/components/_button.scss';
  import '$lib/components/_notched_outline.scss';
  import '$lib/components/_colored_snackbar.scss';
  import '$lib/components/_dialog.scss';
  import '$lib/components/_list.scss';
  import '$lib/components/_card.scss';
  import { dev, version } from '$app/environment';
  import { afterNavigate, beforeNavigate, goto, invalidate, invalidateAll } from '$app/navigation';
  import { derived, writable } from 'svelte/store';
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
    post,
    emit,
    svg,
    ADMIN,
    SUPERUSER,
    afterOrBeforeNavigation,
    parseLifetime,
    printDiff,
    buildSearchParams
  } from '$lib/utils';
  import {
    currentMediaStore,
    fabs,
    flash,
    framework,
    session,
    theme,
    ticker,
    urls,
    videos,
    images,
    users,
    streams,
    selection,
    videosAll,
    sessionHelper
  } from '$lib/stores';
  import { Modal, SvgIcon, DoubleBounce } from '$lib/components';
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
  import Dialog, { Title as DialogTitle, Content, Actions as DialogActions } from '@smui/dialog';
  import { IMAGE, VIDEO } from '$lib/utils/const';
  import { inject } from '@vercel/analytics';
  import type { NavigationTarget } from '@sveltejs/kit';
  import type { Dropzone } from '$lib/components/Dropzone/type';
  import type { User } from '$lib/classes/repos/types';

  inject({ mode: dev ? 'development' : 'production' });

  const snackbarLifetime = 4000;
  const redirectDelay = 300;
  const LIGHT = 'light';
  const DARK = 'dark';

  let root: Element;
  let outerElement: HTMLDivElement;
  let snackbarMessage = '';
  let actionLink: string;
  let actionLabel: string;
  let timeoutId: number | undefined;
  let pollId;
  let loggedInButtonTextSecondLine: string;
  let emphasize: string;
  let snackbar: Snackbar;
  let settingsDialog: Dialog;
  let deletingMediaDialog: Dialog;
  let media: any | undefined;
  let loaderBackgroundOpacity = 1;
  let loaderColor = 'var(--primary)';
  let loaderBackgroundColor: string;
  let colorSchema: { current: any; requested: any };
  let mediaMode: string | undefined;
  let isMounted = false;
  let isPreferredDarkMode;
  let dropzone: Dropzone;

  setContext('progress', {
    getProgress: () =>
      derived(streams, ($streams, set) => {
        const res = $streams.reduce<number>((map, el) => {
          let { total, received } = el.stream;
          if (received !== undefined && total !== undefined && total > 0) {
            let percent = (received * 100) / total;
            let maxmin = Math.min(100, Math.max(0, map + percent));
            total &&
              console.log('=', Number(maxmin.toFixed(2)).minimumIntegerDigits(3), total, received);
            return maxmin;
          } else {
            let maxmin = Math.min(100, Math.max(0, map));
            total &&
              console.log('!', Number(maxmin.toFixed(2)).minimumIntegerDigits(3), total, received);
            return maxmin;
          }
        }, 0);
        set(res);
      })
  });

  setContext('logger', {
    log: (...args: any[]) => {
      const { log } = $page.data.config.Console;
      if (log) console.log(...args);
    },

    info: (...args: any[]) => {
      if (args.length < 2) return;
      const { infoLevel } = $page.data.config.Console;
      args = Array.from(args);
      const level = args.splice(0, 1)[0];
      if (level <= Number(infoLevel)) console.log(...args);
    }
  });

  setContext('dropzone', {
    getDropzone: () => dropzone
  });

  setContext('fab', {
    setFab: (name: any) => fabs.update(name),
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

  const mounted = writable(isMounted);
  setContext('mounted', {
    mounted
  });

  setContext('media', {
    getNameByEndpoint: (endpoint: string | null) => {
      if (endpoint === IMAGE) return $_('text.images');
      if (endpoint === VIDEO) return $_('text.videos');
    }
  });

  setContext('search', {
    searchUsers: (data: any, limit: number = 10) =>
      searchBy('/repos/users', { match: data, limit }),
    searchVideos: (data: any, limit: number = 10) =>
      searchBy('/repos/videos', { match: data, limit }),
    searchVideosAll: (data: any, limit: number = 10) =>
      searchBy('/repos/videos/all', { match: data, limit })
  });

  const { info }: any = getContext('logger');
  const editableSettings = new Map([
    ['Console', ['infoLevel']],
    ['Session', ['foo', 'bar']]
  ]);
  const { getSnackbar }: any = getContext('snackbar');

  ticker.subscribe((val) => {
    info(
      5,
      '%c TICKER %c %s',
      'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
      'background: #ffff81; color: #000000; padding:4px 6px 3px 0;',
      `${(!isNaN(val) && (val / 1000).toHHMMSS()) || '--'}`
    );
    if (val === 0) {
      emit('session:stop');
    }
  });

  const { getSegment }: any = getContext('segment');
  const segment = getSegment();

  const afterNavigationCallback = async (
    excludes: globalThis.Map<any, any>,
    { from, to }: { from: NavigationTarget | null; to: NavigationTarget | null }
  ) => {
    if (excludes.size) {
      info(
        2,
        '%c Extend session prevented',
        'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
        excludes
      );
    } else {
      emit('session:validate');
    }
  };

  afterOrBeforeNavigation(
    afterNavigate,
    {
      to_searches: [],
      from_pathnames: ['/logout'],
      to_pathnames: ['/auth?/logout', '/auth?/login', '/login', '/logout']
    },
    afterNavigationCallback
  );

  beforeNavigate(({ cancel }) => {
    if ($navigating) {
      cancel();
    }
  });

  $: printDiff($page.data, { store: 'page' });
  $: logo = svg(svg_manifest.logo_vod, $theme.primary);
  $: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
  $: root && ((user) => root.classList.toggle('loggedin', user))(!!$session.user);
  $: root && ((isPrivileged) => root.classList.toggle('admin', isPrivileged))(hasPrivileges);
  $: root && root.classList.toggle('home', $segment === 'home');
  $: if ($session.user) {
    loggedInButtonTextSecondLine = `${$session.salutation}, ${$session.user.name}`;
  }
  $: searchParamsString = $page.url.searchParams.toString();
  $: search = searchParamsString && `?${searchParamsString}`;
  $: settingsDialog?.setOpen($page.url.searchParams.get('modal') === 'settings');
  $: $locale && setTheme(colorSchema?.current.mode);
  $: $mounted &&
    (loaderBackgroundColor = colorSchema.current.mode === DARK ? '#000000' : '#ffffff');
  $: currentStore = $currentMediaStore;

  onMount(async () => {
    root = document.documentElement;
    snackbar = getSnackbar();

    initListener();
    initMediaListener();
    checkSession();
    initClasses();
    initStyles();
    printCopyright();

    isPreferredDarkMode = !window.matchMedia('(prefers-color-scheme: light)').matches;
    const mode = isPreferredDarkMode ? DARK : LIGHT;
    setTheme(mode);

    $mounted = true;
    return () => {
      removeListener();
      removeClasses();
    };
  });

  async function checkSession() {
    emit('session:validate', { callback: fadeIn });
  }

  function fadeIn() {
    setTimeout(() => {
      loaderBackgroundOpacity = 0.45;
      loaderColor = 'var(--flash)';
      outerElement?.classList.remove('opacity-0');
    });
  }

  function initListener() {
    window.addEventListener('session:validate', sessionValidateHandler);
    window.addEventListener('session:success', sessionSuccessHandler);
    window.addEventListener('session:error', sessionErrorHandler);
    window.addEventListener('session:stop', sessionStopHandler);
    window.addEventListener('video:save', videoSaveHandler);
    window.addEventListener('video:add', videoAddHandler);
    window.addEventListener('user:save', userSaveHandler);
    window.addEventListener('user:delete', userDeleteHandler);
    window.addEventListener('media:delete', mediaDeleteHandler);
    window.addEventListener('media:deleteMany', mediaDeleteManyHandler);
    window.addEventListener('dropzone:init', dropzoneInitializedHandler);
    document.addEventListener('visibilitychange', visibilityChangeHandler);
  }

  function dropzoneInitializedHandler({ detail }: CustomEvent) {
    dropzone = detail;
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

  function setTheme(mode: string | undefined) {
    colorSchema = setColorSchema(mode);
    root?.classList.toggle(DARK, mode === DARK);
    mediaMode = mode;
  }

  function setColorSchema(m = LIGHT) {
    const mode = m === LIGHT ? DARK : LIGHT;
    const getSchemaIcon = (m: string) => (m === DARK ? 'dark_mode' : 'light_mode');
    const getSchemaLabel = (m: string) => (m === DARK ? $_('text.dark_mode') : $_('light_mode'));
    return {
      current: {
        mode: m,
        icon: getSchemaIcon(m),
        label: getSchemaLabel(m)
      },
      requested: {
        mode,
        icon: getSchemaIcon(mode),
        label: getSchemaLabel(mode)
      }
    };
  }

  function removeListener() {
    window.removeEventListener('session:validate', sessionValidateHandler);
    window.removeEventListener('session:success', sessionSuccessHandler);
    window.removeEventListener('session:error', sessionErrorHandler);
    window.removeEventListener('session:stop', sessionStopHandler);
    window.removeEventListener('video:save', videoSaveHandler);
    window.removeEventListener('video:add', videoAddHandler);
    window.removeEventListener('user:save', userSaveHandler);
    window.removeEventListener('user:delete', userDeleteHandler);
    window.removeEventListener('media:delete', mediaDeleteHandler);
    window.removeEventListener('media:deleteMany', mediaDeleteManyHandler);
    window.removeEventListener('dropzone:init', dropzoneInitializedHandler);
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
  }

  function removeClasses() {
    root.classList.remove('ismobile');
  }

  function initMediaListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', mediaChangedHandler);
  }

  async function mediaChangedHandler({ matches }: any) {
    const mode = matches ? LIGHT : DARK;
    setTheme(mode);
  }

  async function videoSaveHandler({ detail }: CustomEvent) {
    const { data, show, onsuccess, onerror, relational } = detail;
    const res = await fetch(`/videos/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(async (res) => {
      if (res.ok) return await res.json();
    });

    if (res?.success) {
      videos.put(data);
      // Reload relational images repo in order to reflect poster changes
      if (relational) {
        await fetch(`/repos/images?autolimit=true`)
          .then(async (res) => await res.json())
          .then((res) => {
            if (res.success) {
              images.update(res.data);
            }
          });
        onsuccess?.(res);
      } else {
        onerror?.(res);
      }
    }

    if (show) {
      let message = res.message || res.data.message;
      configSnackbar(message);
      snackbar?.forceOpen();
    }
  }

  async function fetchImages(path: string) {
    return await fetch(path)
      .then(async (res) => await res.json())
      .then((res) => res);
  }

  async function videoAddHandler({ detail }: CustomEvent) {
    let data = detail.data;
    if (!Array.isArray(data)) {
      data = [data];
    }
    hasPrivileges ? videos.add(data) : videosAll.add(data);
  }

  async function mediaDeleteHandler({ detail }: CustomEvent) {
    const { id, type, show, onsuccess, onerror } = detail;
    const res = await fetch(`/${type}/${id}`, { method: 'DELETE' }).then(async (res) => {
      if (res.ok) return await res.json();
    });
    const stores = new Map();
    stores.set('images', { store: images, relatedStore: videos, relatedEndpoint: '/repos/videos' });
    stores.set('videos', { store: videos, relatedStore: images, relatedEndpoint: '/repos/images' });
    const { store, relatedStore, relatedEndpoint } = stores.get(type);

    if (res?.success) {
      urls.del(id);
      store.del(id);
      await fetch(`${relatedEndpoint}?autolimit=true`)
        .then(async (res) => await res.json())
        .then((res) => {
          if (res.success) {
            relatedStore.update(res.data);
          }
        });
      onsuccess?.(res);
    } else {
      onerror?.(res);
    }

    if (show) {
      let message = res.message || res.data.message;
      configSnackbar(message);
      snackbar?.forceOpen();
    }
  }

  async function searchBy(endpoint: string, data: any) {
    return await fetch(`${endpoint}`, { method: 'POST', body: JSON.stringify(data) }).then(
      async (res) => await res.json()
    );
  }

  const { getNameByEndpoint }: any = getContext('media');

  async function mediaDeleteManyHandler({ detail }: CustomEvent) {
    const {
      endpoint,
      show,
      oncompleted
    }: { endpoint: string; show: boolean; oncompleted: () => void } = detail;

    deletingMediaDialog?.setOpen(true);
    const errors = [];
    const ids = $selection.slice();
    ids.forEach(async (id: string) => {
      media = $currentStore.find((media: any) => media.id === id);
      if (media) {
        const res = await fetch(`/${endpoint}/${media.id}`, { method: 'DELETE' }).then(
          async (res) => {
            if (res.ok) return await res.json();
          }
        );
        await tick();
        if (res?.success) {
          urls.del(id);
          currentStore.del(id);
        } else {
          errors.push(id);
        }
      }
    });
    oncompleted?.();
    deletingMediaDialog?.setOpen(false);

    if (show) {
      let message = errors.length
        ? $_('text.errors-occured', {
            values: {
              count: errors.length,
              type: getNameByEndpoint(endpoint)
            }
          })
        : $_('text.all-media-deleted', {
            values: {
              count: ids.length,
              type: getNameByEndpoint(endpoint)
            }
          });
      configSnackbar(message);
      snackbar?.forceOpen();
    }
  }

  async function userSaveHandler({ detail }: CustomEvent) {
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

  async function userDeleteHandler({ detail }: CustomEvent) {
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

  function configSnackbar(msg: string | undefined, link?: undefined) {
    try {
      snackbar?.close();
    } catch (e) {}
    configureAction(msg, link);
  }

  function configureAction(msg = '', link?: string | { actionLabel: string; actionLink: string }) {
    actionLabel = '';
    actionLink = '';
    snackbarMessage = msg;
    if (typeof link === 'object') {
      actionLabel = link?.actionLabel;
      actionLink = link.actionLink;
    } else if (link) {
      actionLink = link;
    }
  }

  function handleSnackbarOpened() {
    if (!actionLabel && actionLink) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => actionLink && goto(actionLink), redirectDelay);
    }
  }

  function handleSnackbarClosed() {}

  async function sessionSuccessHandler({ detail }: CustomEvent) {
    const { data, callback } = detail;
    const { user, renewed, message }: { user: User; renewed: boolean; message: string } = {
      ...data
    };
    await invalidateAll();
    flash.update({
      message,
      type: 'success',
      timeout: 1500
    });

    renewed && localStorage.setItem('renewed', 'true');
    configSnackbar(
      $_('text.external-login-welcome-message', {
        values: { name: user.name }
      })
    );
    snackbar?.forceOpen();

    callback?.();
  }

  async function visibilityChangeHandler() {
    const callback = async ({ success }: { success: boolean }) => {
      if (success) {
        await invalidate('app:session');
        await invalidate('app:main');
      }
    };
    if (document.visibilityState === 'visible') {
      emit('session:validate', { callback });
    }
  }

  async function sessionValidateHandler({ detail }: CustomEvent) {
    const lifetime = $page.data.config.Session?.lifetime;
    const _expires = new Date(Date.now() + parseLifetime(lifetime)).toISOString();
    return await post('/session/validate', { _expires }).then(async (res) => {
      if (res.success === true) {
        sessionHelper.update({ _expires });
      } else if (res.success === false) {
        if ($session.user) {
          emit('session:stop');
        }
      }
      detail?.callback?.(res);
    });
  }

  function sessionErrorHandler({ detail }: CustomEvent) {
    const data = { ...detail };
    invalidate('app:session');
    flash.update({ ...data, type: 'error', timeout: 3500 });
    if (data.redirect) {
      setTimeout(async () => await goto(data.redirect), 3000);
    }
  }

  async function sessionStopHandler({ detail }: CustomEvent) {
    await killSession(detail?.options);
    await invalidateAll();
    detail?.callback?.();
  }

  async function killSession(options = {}) {
    return await post('/auth/logout', { ...options }).then((res) => {
      snackbarMessage = res?.message || res.data?.message;
      configSnackbar(snackbarMessage);
      snackbar?.forceOpen();
      return res;
    });
  }

  function changedLocaleHandler({ detail }: CustomEvent) {
    emit('session:validate');

    const locale = detail.locale;
    configSnackbar($_('text.language_is_now', { values: { locale } }));
    snackbar?.forceOpen();
  }

  function isEditable({ section, key }: { section: any; key: string }) {
    let editableSection = editableSettings.get(section);
    if (Array.isArray(editableSection)) {
      return !!editableSection.find((item) => item === key);
    } else {
      return editableSection === key;
    }
  }

  function makeEditable(event: MouseEvent, id: string) {
    // TODO
  }

  function printCopyright(color?: string) {
    color = color || '#ad1457';
    $page.data.ua.name.toLowerCase() === 'chrome'
      ? console.log(
          '%c %c Axel Nitzschner - Immersive Studio %c https://vod-app-svelte-kit.vercel.app/ ',
          'background: #ad1457; padding:5px 0; margin:3px 0 10px 0;',
          'background: #eeeeee; color: #e2370f; padding:5px; margin:3px 0 10px 0;',
          'background: #ad1457; color: #fff; padding:5px; margin:3px 0 10px 0;'
        )
      : console.log(
          ' Axel Nitzschner - Immersive Studio - https://vod-app-svelte-kit.vercel.app/ '
        );
  }
</script>

<svelte:head>
  <link id="media-mode" rel="stylesheet" href={`/smui${mediaMode === DARK ? '-dark' : ''}.css`} />
</svelte:head>

<Icons />

{#if $locale}
  <Modal header={{ name: 'text.upload-type' }} key="default-modal">
    <Modal header={{ name: 'text.edit-uploaded-content' }} key="editor-modal">
      <div bind:this={outerElement} class="transition opacity-0">
        <form
          use:enhance={({ action, cancel }) => {
            const actionParam = new URLSearchParams(action.searchParams)
              .keys()
              .next()
              .value?.replace(/\//, '');
            if (!actionParam) cancel();
            return async ({ result }) => {
              if (actionParam === 'reload') {
                if (result.type === 'success') {
                  invalidate('app:session');
                }
              }
              if (actionParam === 'logout') {
                loggedInButtonTextSecondLine = $_('text.one-moment');
                if ((result.type = 'success')) {
                  emit('session:stop');
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
                <Label>{$_('text.library')}</Label>
              </NavItem>
            {/if}

            {#if hasPrivileges}
              <NavItem
                href={$page.url.pathname.startsWith('/users') ? $page.url.href : `/users`}
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
                  size={40}
                  borderSize={2}
                  borderColor={'--primary'}
                  dense
                  user={$session.user}
                  badge={{
                    icon: 'settings',
                    color: '--primary',
                    position: 'BOTTOM_RIGHT'
                  }}
                />
              </NavItem>
            {:else}
              <NavItem title="Avatar" class="hide-if-mobile">
                <span style="min-width: 40px;">
                  <SvgIcon
                    name="person"
                    size={40}
                    style="border: 1px solid; border-radius: 99px;"
                  />
                </span>
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
              <MoreMenu labelSize="1em">
                <FrameworkSwitcher
                  defaultIndex={1}
                  db={[
                    {
                      name: 'Sapper',
                      icon: 'sapper-icon',
                      icontype: 'svg',
                      href: 'https://github.com/anito/vod-app',
                      host: dev ? 'http://localhost:3001' : 'https://vod-app.vercel.app/',
                      target: '_blank',
                      disabled: false
                    },
                    {
                      name: 'SvelteKit',
                      icon: 'svelte-kit-icon',
                      icontype: 'svg',
                      href: 'https://github.com/anito/vod-app-svelte-kit',
                      host: dev
                        ? 'https://localhost:3000'
                        : 'https://vod-app-svelte-kit.vercel.app/',
                      target: '_blank'
                    }
                  ]}
                />
                <Separator />
                <Item class="justify-start">
                  <Button href={$framework.href} target="_blank" class="link-button" ripple={false}>
                    <span style="display: flex; flex: 1 0 100%; align-items: center">
                      <SvgIcon name="github" class="mr-2" />
                      <Label>GitHub</Label>
                    </span>
                  </Button>
                </Item>
                <Separator />
                <Item class="justify-start">
                  <Button
                    on:click$preventDefault={() => setTheme(colorSchema?.requested.mode)}
                    class="link-button"
                    ripple={false}
                  >
                    <span style="display: flex; flex: 1 0 100%; align-items: center">
                      <SvgIcon name={colorSchema?.requested.icon} class="mr-2" />
                      <Label>{colorSchema?.requested.label}</Label>
                    </span>
                  </Button>
                </Item>
                <Separator />
                <Item class="justify-start">
                  <Button formaction="/config?/reload" class="link-button" ripple={false}>
                    <SvgIcon name="sync" class="mr-2" />
                    <Label>Reload Config</Label>
                  </Button>
                </Item>
                <Separator />
                <Item class="justify-start">
                  <Button
                    href={`${$page.url.pathname}${buildSearchParams($page.url.searchParams, {
                      addableKeys: [['modal', 'settings']]
                    })}`}
                    class="link-button"
                    ripple={false}
                  >
                    <SvgIcon name="settings" class="mr-2" />
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
<LoadingModal backgroundColor={loaderBackgroundColor} opacity={loaderBackgroundOpacity} wait={1000}>
  <DoubleBounce color={loaderColor} unit="px" size="200" />
</LoadingModal>
<Dialog
  bind:this={deletingMediaDialog}
  aria-labelledby="info-title"
  aria-describedby="info-content"
  on:SMUIDialog:closed={() => (media = undefined)}
>
  <DialogTitle id="info-title">{$_('text.deleting-media')}</DialogTitle>
  <Content>
    <div class="">
      {$_('text.permanently-deleting-media', { values: { title: media?.title || '' } })}
    </div>
  </Content>
</Dialog>
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
      <div style="position: absolute; right: 20px; top: 20px; font-size: .5rem;">
        VERSION: {version}
      </div>
      <ul class="level-1">
        {#each Object.entries($page.data.config).sort() as setting}
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
  timeoutMs={snackbarLifetime}
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
    padding-left: 5px;
    margin-bottom: 10px;
  }
</style>
