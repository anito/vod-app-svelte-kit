<script>
	// @ts-nocheck

	import * as api from '$lib/api';
	import { page, session } from '$app/stores';
	import { onMount, setContext } from 'svelte';
	import { UserManager, TimeManager, MailManager } from '$lib/components';
	import Button, { Group, Label, Icon } from '@smui/button';
	import { users, slim, sitename } from '$lib/stores';
	import { proxyEvent, INBOX, ADMIN, SUPERUSER, TABS } from '$lib/utils';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';

	const defaultTab = 2;
	const defaultSearch =
		defaultTab === 0
			? `?tab=${TABS[defaultTab]}`
			: defaultTab === 1
			? `?tab=${TABS[defaultTab]}`
			: defaultTab === 2
			? `?tab=${TABS[defaultTab]}&active=${INBOX}`
			: '';

	let userExpires;
	/**
	 * @type {null}
	 */
	let hasExpired;
	let token;
	/**
	 * @type {string}
	 */
	let magicLink;
	/**
	 * @type {{ role: string; name: any; }}
	 */
	let currentUser;
	/**
	 * @type {any}
	 */
	let username;

	$: selectionUserId = $page.params.slug;
	$: currentUser = ((id) => $users.length && $users.filter((usr) => usr.id === id)[0])(
		selectionUserId
	);
	$: hasPrivileges = $session.role === ADMIN || $session.role === SUPERUSER;
	$: isCurrentSuperUser = currentUser?.role === SUPERUSER;
	$: username = currentUser?.name || '';
	$: tab = ((t) => TABS.find((itm) => itm === t))($page.url.searchParams.get('tab'));
	$: ((user) => {
		if (!user || isCurrentSuperUser) {
			userExpires = null;
			hasExpired = null;
			token = '';
			magicLink = '';
		} else {
			userExpires = user.expires;
			hasExpired = (userExpires && userExpires * 1000 < +new Date().getTime()) || false;
			token = user.jwt;
			magicLink = token && `http://${$page.host}/login?token=${token}`;
		}
	})(currentUser);
	$: hidden =
		!hasPrivileges || isCurrentSuperUser
			? true
			: selectionUserId == $session.user?.id
			? true
			: false;

	setContext('siux', {
		getSIUX: getSimpleUserIndex
	});

	onMount(() => {
		const pathname = $page.url.pathname;
		const search = $page.url.search || defaultSearch;

		if (!currentUser && $session.user) {
			// Fix not exsiting User-ID
			let path = pathname.replace(/^(\/users\/)([\S]+)$/g, `$1${$session.user.id}`);
			setTimeout(() => goto(`${path}${search}`), 100);
		} else if (!tab) {
			// Preselect a tab if there is none
			setTimeout(() => goto(`${pathname}${search}`), 100);
		}
	});

	async function getSimpleUserIndex() {
		if ($slim) return Promise.resolve($slim);
		return await api
			.get('users/simpleindex', { token: $session.user?.jwt, fetch })
			.then((res) => {
				return res;
			})
			.catch((reason) => console.log(reason));
	}
</script>

<svelte:head>
	<title>{$sitename} | {$_('text.user')} {username}</title>
</svelte:head>

<div class="flex flex-1 user-grid inner-grid {tab}">
	<div class="grid-item toolbar justify-between">
		<Group variant="unelevated">
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=time"
				variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
			>
				<Icon class="material-icons">video_settings</Icon>
				<Label>{$_('text.classes')}</Label>
			</Button>
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=user"
				variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
			>
				<Icon class="material-icons">account_circle</Icon>
				<Label>{$_('text.user-profil')}</Label>
			</Button>
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=mail&active={INBOX}"
				variant={tab === TABS[2] ? 'unelevated' : 'outlined'}
			>
				<Icon class="material-icons">mail</Icon>
				<Label>{$_('text.mail')}</Label>
			</Button>
		</Group>
		<div class="flex mr-2" class:hidden>
			<Button
				on:click={() => proxyEvent('INFO:token:Redirect')}
				disabled={!magicLink}
				variant="unelevated"
			>
				<Icon class="material-icons">{(hasExpired && 'link_off') || 'link'}</Icon>
				<Label>Magic Link</Label>
			</Button>
		</div>
	</div>
	{#if tab === TABS[0]}
		<TimeManager {selectionUserId} />
	{/if}
	{#if tab === TABS[1]}
		<UserManager
			on:user:Redirect
			on:token:Generate
			on:token:Remove
			on:user:Activate
			on:open:InfoDialog
			selectedMode="edit"
			{selectionUserId}
		/>
	{/if}
	{#if tab === TABS[2]}
		<MailManager {selectionUserId} />
	{/if}
</div>

<style>
	.user-grid {
		display: grid;
		grid-template-rows: var(--toolbar-h) auto;
		grid-gap: var(--grid-gap);
		align-items: center;
		grid-template-areas:
			'toolbar toolbar'
			'one one';
		grid-template-columns: 4fr 4fr;
		align-items: initial;
	}
	:global(.user).user-grid {
		grid-template-areas:
			'toolbar toolbar'
			'one one';
		grid-template-columns: 1fr 1fr;
	}
	:global(.time).user-grid {
		grid-template-areas:
			'toolbar toolbar'
			'one two';
		grid-template-columns: 4fr 4fr;
		align-items: initial;
	}
	:global(.mail).user-grid {
		grid-template-areas:
			'toolbar toolbar'
			'one one';
		grid-template-columns: 4fr 4fr;
		align-items: initial;
	}
	:global(.loggedin) .user-grid {
		align-items: initial;
	}
	.grid-item {
		background: var(--back-grid-item);
		padding-left: 0.4rem;
	}
	.toolbar {
		grid-area: toolbar;
		display: flex;
		align-items: center;
		height: var(--toolbar-h);
	}
</style>
