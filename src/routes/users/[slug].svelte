<script context="module">
	import * as api from '$lib/api';

	let slimLoaded = false;

	export async function load({ url, params, session }) {
		let sentData = [];
		let inboxData = [];
		let slimData = [];

		// console.log(url.origin, url.pathname);
		if (url.searchParams.get('tab') === 'mail') {
			const id = params['slug'];
			await api
				.get(`sents/get/${id}`, session.user?.jwt)
				.then((res) => {
					res.success && (sentData = res.data);
				})
				.catch(() => {});
			await api
				.get(`inboxes/get/${id}`, session.user?.jwt)
				.then((res) => {
					res.success && (inboxData = res.data);
				})
				.catch(() => {});
			if (!slimLoaded) {
				await api
					.get(`users/simpleindex`, session.user?.jwt)
					.then((res) => {
						res.success && (slimData = res.data);
						slimLoaded = true;
					})
					.catch(() => {});
			}
		}
		return {
			props: {
				sentData,
				inboxData,
				slimData
			}
		};
	}
</script>

<script>
	// @ts-nocheck

	import { page, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { UserManager, TimeManager, MailManager } from '$lib/components';
	import Button, { Group, Label, Icon } from '@smui/button';
	import { slim, users, sitename, sents, inboxes } from '$lib/stores';
	import { proxyEvent } from '$lib/utils';
	import { _ } from 'svelte-i18n';

	export let inboxData;
	export let sentData;
	export let slimData;

	const TABS = ['user', 'time', 'mail'];
	const defaultTab = TABS[1];

	let userExpires;
	let hasExpired;
	let token;
	let magicLink;
	let currentUser;
	let username;

	if (slimData.length) {
		slim.update(slimData);
	}

	// $: console.log($slim, $sents, $inboxes);
	$: selectionUserId = $page.params.slug;
	$: currentUser = ((id) => $users.length && $users.filter((usr) => usr.id === id)[0])(
		selectionUserId
	);
	$: username = currentUser?.name || '';
	$: tab = ((t) => TABS.find((itm) => itm === t))($page.url.searchParams.get('tab')) || defaultTab;
	$: ((user) => {
		if (!user) return;
		userExpires = user.expires;
		hasExpired = (userExpires && userExpires * 1000 < +new Date().getTime()) || false;
		token = user.jwt;
		magicLink = token && `http://${$page.host}/login?token=${token}`;
	})(currentUser);
	$: hidden =
		$session.role !== 'Administrator' ? true : selectionUserId == $session.user?.id ? true : false;

	onMount(() => {});
</script>

<svelte:head>
	<title>{$sitename} | User {username}</title>
</svelte:head>

<div class="flex flex-1 user-grid inner-grid {tab}">
	<div class="grid-item toolbar justify-between">
		<Group variant="unelevated">
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=time"
				variant={tab === TABS[1] ? 'unelevated' : 'outlined'}
			>
				<Icon class="material-icons">video_settings</Icon>
				<Label>{$_('text.classes')}</Label>
			</Button>
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=user"
				variant={tab === TABS[0] ? 'unelevated' : 'outlined'}
			>
				<Icon class="material-icons">account_circle</Icon>
				<Label>{$_('text.user-profil')}</Label>
			</Button>
			<Button
				class="focus:outline-none focus:shadow-outline"
				sveltekit:prefetch
				href="/users/{selectionUserId}?tab=mail"
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
	{#if tab === TABS[1]}
		<TimeManager {selectionUserId} />
	{/if}
	{#if tab === TABS[0]}
		<UserManager
			on:user:Redirect
			on:token:Generate
			on:token:Remove
			on:user:Activate
			on:open:InfoDialog
			{selectionUserId}
			selectedMode="edit"
		/>
	{/if}
	{#if tab === TABS[2]}
		<MailManager {selectionUserId} {sentData} {inboxData} />
	{/if}
</div>

<style>
	.user-grid {
		display: grid;
		grid-template-rows: var(--toolbar-h) auto;
		grid-gap: var(--grid-gap);
		align-items: center;
		overflow: hidden;
	}
	:global(.user).user-grid {
		grid-template-areas:
			'toolbar toolbar'
			'one two';
		grid-template-columns: 1fr;
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
