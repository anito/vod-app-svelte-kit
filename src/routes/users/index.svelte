<script>
	// @ts-nocheck

	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { sitename } from '$lib/stores';
	import { _ } from 'svelte-i18n';
	import { page, session } from '$app/stores';
	import { INBOX, TABS } from '$lib/utils';

	const defaultTab = 0;
	const defaultSearch =
		(defaultTab === 0 && `?tab=${TABS[defaultTab]}`) ||
		(defaultTab === 1 && `?tab=${TABS[defaultTab]}`) ||
		(defaultTab === 2 && `?tab=${TABS[defaultTab]}&active=${INBOX}`);

	onMount(() => {
		let pathname = $page.url.pathname;
		let slug = $page.params.slug || $session.user?.id;
		let search = $page.url.searchParams.search || defaultSearch;

		setTimeout(() => goto(`${pathname}/${slug}${search}`), 200);
	});
</script>

<svelte:head>
	<title>{$sitename} | Users</title>
</svelte:head>

<div class="flex justify-center items-center flex-1">
	<div class="empty-selection">
		<span style="text-align: center;">{$_('text.empty-user-selection')}</span>
	</div>
</div>

<style>
	.empty-selection {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 2em;
		font-weight: 600;
		color: #d8d8d8;
	}
</style>
