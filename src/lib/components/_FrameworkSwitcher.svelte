<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { frameworks } from '$lib/stores';
	import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, { Item, Separator, Text } from '@smui/list';
	import SvgIcon from './_SvgIcon.svelte';
	import IconButton from '@smui/icon-button';
	import { _ } from 'svelte-i18n';

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
	let selectedFramwork;

	async function setFramework(value) {
		frameworks.update(value);
		await goto(`${$frameworks.host}${$page.url.pathname}${$page.url.search}`);
	}

	function handleClick(e) {
		e.preventDefault();
		!menu.isOpen() && menu.setOpen(true);
	}
</script>

<span class="menu-anchor lg:-mr-8" bind:this={menuAnchor} use:Anchor>
	<IconButton
		class="material-icons on-surface"
		on:click={handleClick}
		aria-label={$_('text.more-options')}
		title={$_('text.more-options')}>more_vert</IconButton
	>
	<Menu bind:this={menu} bind:anchorElement={menuAnchor} anchor={false} anchorCorner="BOTTOM_LEFT">
		<List>
			<SelectionGroup>
				{#each data as fw}
					<Item on:SMUI:action={() => setFramework(fw)} selected={$frameworks.name === fw.name}>
						<SvgIcon name={fw.icon} class="mr-2" />
						<Text>{fw.name}</Text>
						<SelectionGroupIcon>
							<i class="material-icons">check</i>
						</SelectionGroupIcon>
					</Item>
				{/each}
			</SelectionGroup>
			<Separator />
			<Item on:SMUI:action={() => goto($frameworks.git)} class="justify-center">
				<SvgIcon name="github" class="mr-2" />
				<Text>GitHub</Text>
			</Item>
		</List>
	</Menu>
</span>

<style>
</style>
