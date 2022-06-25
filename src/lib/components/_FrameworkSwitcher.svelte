<script>
	// @ts-nocheck

	import { page, session } from '$app/stores';
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
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
			host: dev ? 'http://localhost:3001' : 'https://doojoo.de'
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

	$: token = $session.user?.jwt;
	$: withToken = (token && `/login?token=${token}&redirect=`) || '';
	$: redirect = `${$frameworks.host}${withToken}${$page.url.pathname}${$page.url.search}`;

	async function setFramework(value) {
		frameworks.update(value);
		await tick();
		await goto(redirect);
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
		<List class="option-list">
			<SelectionGroup>
				{#each data as framework}
					<Item
						on:SMUI:action={() => setFramework(framework)}
						selected={$frameworks.name === framework.name}
						disabled={$frameworks.name === framework.name}
					>
						<SvgIcon name={framework.icon} class="mr-2" />
						<Text>{framework.name}</Text>
						<SelectionGroupIcon>
							<i class="material-icons">check</i>
						</SelectionGroupIcon>
					</Item>
				{/each}
			</SelectionGroup>
			<Separator />
			<Item class="justify-center">
				<a class="github" href={$frameworks.git} target="_blank" title={$_('text.goto-github')}>
					<span>
						<SvgIcon name="github" class="mr-2" />
						<Text>GitHub</Text>
					</span>
				</a>
			</Item>
		</List>
	</Menu>
</span>

<style>
	:global(ul.primary ul.option-list > li:not(.nav-item)) a.github,
	:global(ul.primary ul.option-list > li:not(.nav-item)) a.github:hover {
		font-size: inherit;
		font-weight: 300;
	}
</style>
