<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import Menu from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, { Item, Text } from '@smui/list';
	import { Icon } from '$lib/components';

	const defaultFrameworkIndex = 1;
	const frameworks = [
		{
			name: 'Sapper',
			icon: 'sapper-icon',
			host: dev ? 'http://localhost:3001' : 'https://vod.doojoo.de'
		},
		{
			name: 'SvelteKit',
			icon: 'svelte-kit-icon',
			host: dev ? 'http://localhost:3000' : 'https://vod-app.doojoo.de'
		}
	];
	const framework = writable(frameworks[defaultFrameworkIndex]);

	let menu;
	let menuAnchor;

	async function setFramework(value) {
		framework.set(value);
		await goto(`${$framework.host}${$page.url.pathname}${$page.url.search}`);
	}
</script>

<span class="relative">
	<a href="." on:click|preventDefault={() => menu.setOpen(true)} name={$framework.name}>
		<div class="menu-anchor switcher lg:-mr-8" bind:this={menuAnchor} use:Anchor>
			<div class="current-framework">
				<Icon name={$framework.icon} />
			</div>
		</div>
	</a>
	<Menu bind:this={menu} bind:anchorElement={menuAnchor} anchor={false} anchorCorner="BOTTOM_LEFT">
		<List>
			{#each frameworks as fw}
				<Item on:SMUI:action={() => setFramework(fw)}>
					<Icon name={fw.icon} />
				</Item>
			{/each}
		</List>
	</Menu>
</span>

<style>
	.switcher {
		display: inline-block;
	}
</style>
