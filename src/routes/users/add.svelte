<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { sitename } from '$lib/stores';
	import { UserManager } from '$lib/components';
	import { _ } from 'svelte-i18n';

	export let tab = 'time';

	const TABS = ['time', 'user'];

	let root;

	$: tab = ((t) => TABS.find((itm) => itm === t) || TABS[1])(tab);

	onMount(() => {
		root = document.documentElement;
		root.classList.add('add-user-view--open');
		return () => root.classList.remove('add-user-view--open');
	});
</script>

<svelte:head>
	<title>{$sitename} | {$_('text.add-user')}</title>
</svelte:head>

<div class="grid flex-1">
	<UserManager selectedMode="add" />
</div>

<style>
	.grid {
		display: grid;
		grid-template-areas: 'one';
		grid-gap: var(--grid-gap);
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
	}
</style>
