<script context="module">
	import {
		register,
		waitLocale,
		init as init_i18n,
		_,
		locale as i18n,
		getLocaleFromNavigator
	} from 'svelte-i18n';
	import { browser } from '$app/env';

	const fallbackLocale = 'en-US';

	register('de-DE', () => import('../messages/de_DE.json'));
	register('en-US', () => import('../messages/en_US.json'));

	export async function load({ fetch }) {
		async function getLocaleFromSession() {
			return await fetch('/session/recover/locale')
				.then((res) => {
					return res.json();
				})
				.then((res) => {
					return res.data;
				});
		}

		if (browser) {
			init_i18n({
				fallbackLocale,
				initialLocale: await getLocaleFromSession()
			});
		} else {
			init_i18n({
				fallbackLocale,
				initialLocale: await getLocaleFromNavigator()
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
	import { Icons } from '$lib/components';
	import Button, { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import Snackbar, { Actions } from '@smui/snackbar';
	import { Label } from '@smui/common';
	import { del as logout, createRedirectSlug, proxyEvent, svg, __ticker__ } from '$lib/utils';
	import { fabs, settings, theme, ticker, urls, videos, videoEmitter } from '$lib/stores';
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
	let unsubscribeVideoEmitter;
	let emphasize;
	let snackbar;

	setContext('fab', {
		setFab: (fab) => $session.role === 'Administrator' && fabs.update(fab),
		restoreFab: () => fabs.restore()
	});

	setContext('snackbar', {
		getSnackbar: () => snackbar,
		configSnackbar
	});

	const { getSnackbar } = getContext('snackbar');

	ticker.subscribe((val) => {
		// console.log(
		// 	'%c TICKER %c %s',
		// 	'background: #ffd54f; color: #000000; padding:4px 6px 3px 0;',
		// 	'background: #ffff81; color: #000000; padding:4px 6px 3px 0;',
		// 	`${(!isNaN(val) && parseInt(val / 1000) + ' s') || '--'}`
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
	$: search = searchParams && `?${searchParams}`;
	$: $page.url.pathname && proxyEvent('ticker:extend');

	onMount(() => {
		root = document.documentElement;
		snackbar = getSnackbar();

		serverConfig().then(() => proxyEvent('ticker:extend'));
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
		window.addEventListener('ticker:extend', tickerExtendHandler);
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
		window.removeEventListener('ticker:extend', tickerExtendHandler);
	}

	function removeSubscribers() {
		unsubscribeVideoEmitter();
	}

	function removeClasses() {
		root.classList.remove('ismobile');
	}

	/**
	 * Saves video changes and deletions
	 * @param item
	 */
	async function put({ data, show }) {
		const res = await api.put(`videos/${data.id}`, data, user?.jwt);
		if (show) {
			let message = res.message || res.data.message;
			snackbar.isOpen && snackbar.close();
			configSnackbar(message);
			snackbar.open();
		}
		videos.put(data);
	}

	async function del({ data, show }) {
		const res = await api.del(`videos/${data.id}`, user?.jwt);
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
			proxyEvent('ticker:end', { user: $session.user });
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
		$session.role = user.role;
		$session.groups = groups;

		proxyEvent('ticker:extend');

		renewed && localStorage.setItem('renewed', renewed);
		configSnackbar(
			$_('text.external-login-welcome-message', {
				values: { name: user.name }
			})
		);
		snackbar?.open();
	}

	function tickerEndHandler(e) {
		$session.user = null;
		$session.groups = null;
		$session.role = null;
		$session._expires = null;

		proxyEvent('ticker:ended');
	}

	async function tickerEndedHandler(e) {
		await logout(`/auth/logout`).then((res) => {
			if (res) {
				message = res.message || res.data?.message;

				configSnackbar(message);
				snackbar = getSnackbar();
				snackbar?.open();
			}
		});

		setTimeout(
			(path, searchMap) => {
				goto(`${path}${createRedirectSlug($page.url, searchMap)}`);
			},
			1000,
			'/',
			new Map([['sessionend', 'true']])
		);
	}

	async function tickerExtendHandler() {
		if ($session.user) {
			$session._expires = new Date(Date.now() + parseInt($settings.Session?.lifetime));
		}
	}
</script>

<Icons />

<Modal>
	{#if $session && $i18n}
		<form
			class="main-menu"
			on:submit|stopPropagation|preventDefault={submit}
			method="post"
			action="/login"
		>
			<Nav {segment} {page} {logo}>
				{#if $session.user}
					<NavItem href="/videos" title="Videothek" segment="videos">
						<Icon class="material-icons" style="vertical-align: middle;">video_library</Icon>
						<Label>{$_('nav.library')}</Label>
					</NavItem>
				{/if}

				{#if $session.role === 'Administrator'}
					<NavItem href="/users" title="Administration" segment="users">
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
					<NavItem href="/login{search}">
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
						<UserGraphic borderSize="3" borderColor="--prime" dense size="40" fallback={person} />
					</NavItem>
				{/if}

				<NavItem title={$_('text.choose-locale')}>
					<LocaleSwitcher />
				</NavItem>

				<NavItem title={$_('text.choose-framework')} style="vertical-align: sub;">
					<FrameworkSwitcher />
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
	.main-menu :global(button.sign-in-out .no-break) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
