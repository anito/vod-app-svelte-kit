<script context="module">
	import {
		register,
		getLocaleFromNavigator,
		getLocaleFromQueryString,
		waitLocale,
		init as init_i18n
	} from 'svelte-i18n';
	import { browser } from '$app/env';

	register('en-US', () => import('../messages/en-US.json'));
	register('de-DE', () => import('../messages/de-DE.json'));

	if (browser) {
		// init on client side only
		// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
		init_i18n({
			fallbackLocale: 'en-US',
			initialLocale: getLocaleFromNavigator()
		});
	}

	export async function load() {
		if (!browser) {
			// init on server side only, need to get query from `page.query.get("lang")`
			init_i18n({
				fallbackLocale: 'en-US',
				initialLocale: getLocaleFromQueryString('lang')
			});
		}
		await waitLocale();
		return {};
	}
</script>

<script>
	// @ts-nocheck

	import '../app.css';

	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import { page, session } from '$app/stores';
	import { getContext, onMount, setContext } from 'svelte';
	import isMobile from 'ismobilejs';
	import { Icons, Icon as ExternalIcon } from '$lib/components';
	import Button, { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import Snackbar, { Actions } from '@smui/snackbar';
	import { Label } from '@smui/common';
	import { del as logout, createRedirectSlug, proxyEvent, svg, __ticker__ } from '$lib/utils';
	import {
		fabs,
		frameworks,
		settings,
		theme,
		ticker,
		urls,
		videos,
		videoEmitter
	} from '$lib/stores';
	import { Modal } from '$lib/components';
	import { Jumper } from 'svelte-loading-spinners';
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
	import { serverConfig } from '$lib/config';

	const snackbarLifetimeDefault = 4000;
	const redirectDelay = 300;

	let root;
	let message = '';
	let action = '';
	let path = '';
	let timeoutId;
	let isMobileDevice;
	let loggedInButtonTextSecondLine;
	let unsubscribeTicker;
	let unsubscribeVideoEmitter;
	let unsubscribeSettings;
	let emphasize;
	let snackbar;

	// load configuration from server
	serverConfig();

	setContext('snackbar', {
		getSnackbar: () => snackbar,
		configSnackbar
	});

	const { getSnackbar } = getContext('snackbar');

	setContext('fab', {
		setFab: (fab) => $session.role === 'Administrator' && fabs.update(fab),
		restoreFab: () => fabs.restore()
	});

	$: $session.user && proxyEvent('ticker:recover');
	$: $settings && proxyEvent('ticker:recover');
	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
	$: $session.user && proxyEvent('ticker:recover');
	$: segment = $page.url.pathname.match(/\/([a-z_-]*)/)[1];
	$: user = $session.user;
	$: person = svg(svg_manifest.person, $theme.primary);
	$: logo = svg(svg_manifest.logo_vod, $theme.primary);
	$: root && ((user) => root.classList.toggle('loggedin', user))(!!$session.user);
	$: root &&
		((isAdmin) => root.classList.toggle('admin', isAdmin))($session.role === 'Administrator');
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
	$: location = searchParams && `?${searchParams}`;

	unsubscribeTicker = ticker.subscribe((val) => {
		if (val === 0) {
			proxyEvent('ticker:end', { path: 'login' });
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

	onMount(async () => {
		root = document.documentElement;
		snackbar = getSnackbar();

		initListener();
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
		window.addEventListener('ticker:ended', tickerEndedHandler);
		window.addEventListener('ticker:recover', tickerRecoverHandler);
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
		window.removeEventListener('ticker:ended', tickerEndedHandler);
		window.removeEventListener('ticker:recover', tickerRecoverHandler);
	}

	function removeSubscribers() {
		unsubscribeSettings();
		unsubscribeVideoEmitter();
		unsubscribeTicker();
	}

	function removeClasses() {
		root.classList.remove('ismobile');
	}

	/**
	 * Saves video changes and deletions
	 * @param item
	 */
	async function put({ data, show }) {
		const res = await api.put(`videos/${data.id}?lang=${$locale}`, data, user?.token);
		if (show) {
			let message = res.message || res.data.message;
			snackbar.isOpen && snackbar.close();
			configSnackbar(message);
			snackbar.open();
		}
		videos.put(data);
	}

	async function del({ data, show }) {
		const res = await api.del(`videos/${data.id}?lang=${$locale}`, user?.token);
		if (res?.success) {
			if (show) {
				let message = res.message || res.data.message;
				snackbar.isOpen && snackbar.close();
				configSnackbar(message);
				snackbar.open();
			}

			urls.del(data.id);
			videos.del(data.id);
		}
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
		!action && path && (message = `${message}...`);
	}

	function handleOpened() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => !action && path && goto(path), redirectDelay);
	}

	function handleClosed() {}

	function tickerStartHandler(e) {
		const { user, groups, renewed } = { ...e.detail };

		$session.user = user;
		$session.role = user.group.name;
		$session.groups = groups;

		renewed && localStorage.setItem('renewed', renewed);

		configSnackbar(
			$_('text.external-login-welcome-message', {
				values: { name: user.name }
			})
		);
		snackbar = getSnackbar();
		snackbar?.open();
	}

	async function tickerEndHandler(e) {
		if (!$session.user) return;

		await logout(`/auth/logout?lang=${$locale}`).then((res) => {
			if (res.success) {
				proxyEvent('ticker:ended', { ...e.detail.data });
				message = res.message;

				configSnackbar(message);
				snackbar = getSnackbar();
				snackbar?.open();
			}
		});
	}

	function tickerEndedHandler(e) {
		unsubscribeTicker && unsubscribeTicker();

		$session.user = null;
		$session.groups = null;
		$session.role = null;
		$session.expires = null;

		setTimeout(
			(path) => {
				goto(`${path}${createRedirectSlug($page.url)}`);
			},
			1000,
			e.detail.path || '/'
		);
	}

	function tickerRecoverHandler() {
		if ($session.user) {
			$session.expires = new Date(Date.now() + parseInt($settings.Session?.lifetime));
		}
	}
</script>

<Icons />

<Modal>
	{#if $session && $locale}
		<form class="main-menu" on:submit|stopPropagation|preventDefault={submit} method="post">
			<Nav {segment} {page} {logo}>
				{#if $session.user}
					<NavItem href="/videos" title="Videothek">
						<Icon class="material-icons" style="vertical-align: middle;">video_library</Icon>
						<Label>{$_('nav.library')}</Label>
					</NavItem>
				{/if}

				{#if $session.role === 'Administrator'}
					<NavItem href="/users" title="Administration">
						<Icon class="material-icons" style="vertical-align: middle;">settings</Icon>
						<Label>Admin</Label>
					</NavItem>
				{/if}

				{#if $session.user}
					<NavItem>
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
					<NavItem href="/login{location}">
						<Button color="secondary" variant="raised" class="sign-in-out button-login">
							<Label>{$_('nav.login')}</Label>
						</Button>
					</NavItem>
				{/if}

				{#if $session.user}
					<NavItem title="Avatar" href="/users/{$session.user?.id}?tab=user">
						<UserGraphic
							borderSize="3"
							borderColor="--prime"
							dense
							width="40"
							height="40"
							user={$session.user}
							fallbackImage={person}
						/>
					</NavItem>
				{:else}
					<NavItem title="Avatar">
						<UserGraphic
							borderSize="3"
							borderColor="--prime"
							dense
							width="40"
							height="40"
							fallbackImage={person}
						/>
					</NavItem>
				{/if}

				<NavItem title={$_('text.choose-locale')}>
					<LocaleSwitcher />
				</NavItem>

				<NavItem title={$_('text.choose-framework')}>
					<FrameworkSwitcher />
				</NavItem>

				<NavItem external={$frameworks.git} title="GitHub Repo">
					<ExternalIcon name="github" />
				</NavItem>
			</Nav>
		</form>
		<slot />
	{/if}
</Modal>
<LoadingModal backgroundColor="#ffffff" opacity=".45" wait="400">
	<Jumper size="200" color="var(--flash)" unit="px" />
</LoadingModal>

<Snackbar
	bind:this={snackbar}
	snackbarLifetimeMs={snackbarLifetime}
	labelText={message}
	on:MDCSnackbar:closed={handleClosed}
	on:MDCSnackbar:opened={handleOpened}
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
	.button-first-line {
		position: absolute;
		width: 84%;
		text-overflow: ellipsis;
		display: inline-block;
		overflow: hidden;
		white-space: nowrap;
	}
	.main-menu :global(button.sign-in-out) {
		height: 74px;
		width: 130px;
	}
	:global(.is-login-page) .main-menu :global(button.sign-in-out) {
		transform: translateY(-60px);
		transition: all 0.4s ease-out;
	}
	.main-menu :global(button.sign-in-out) {
		transform: translateY(0px);
		transition: all 0.4s ease-in;
	}
	.main-menu :global(button .no-break) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
