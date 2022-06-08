<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { frameworks } from '$lib/stores';
	import Menu from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, { Item, Text } from '@smui/list';
	import { Icon } from '$lib/components';

	const defaultFrameworkIndex = 1;
	const data = [
		{
			name: 'Sapper',
			icon: 'sapper-icon',
			git: 'https://github.com/anito/vod-app',
			host: dev ? 'http://localhost:3001' : 'https://vod.doojoo.de'
		},
		{
			name: 'SvelteKit',
			icon: 'svelte-kit-icon',
			git: 'https://github.com/anito/vod-app-svelte-kit',
			host: dev ? 'http://localhost:3000' : 'https://vod-app.doojoo.de'
		}
	];
	frameworks.update(data[defaultFrameworkIndex]);

	let menu;
	let menuAnchor;

	async function setFramework(value) {
		frameworks.set(value);
		await goto(`${$frameworks.host}${$page.url.pathname}${$page.url.search}`);
	}
</script>

<span class="relative">
	<a href="." on:click|preventDefault={() => menu.setOpen(true)} name={$frameworks.name}>
		<div class="menu-anchor switcher lg:-mr-8" bind:this={menuAnchor} use:Anchor>
			<div class="current-framework">
				<Icon name={$frameworks.icon} />
			</div>
		</div>
	</a>
	<Menu bind:this={menu} bind:anchorElement={menuAnchor} anchor={false} anchorCorner="BOTTOM_LEFT">
		<List>
			{#each data as fw}
				<Item on:SMUI:action={() => setFramework(fw)}>
					<Icon name={fw.icon} class="mr-2" />
					<Text>{fw.name}</Text>
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
