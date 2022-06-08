<script>
	// @ts-nocheck

	import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
	import { Anchor } from '@smui/menu-surface';
	import List, { Item, Text } from '@smui/list';
	import { _, locale, locales } from 'svelte-i18n';

	let localeMenu;
	let localeMenuAnchor;
	let currentLocale;

	locale.subscribe((cur) => (currentLocale = cur));

	async function setLocale(value) {
		locale.set(value);
	}
</script>

<span class="relative">
	<a href="." on:click|preventDefault={() => localeMenu.setOpen(true)}>
		<div class="menu-anchor switcher lg:-mr-8" bind:this={localeMenuAnchor} use:Anchor>
			<div class="current-locale">{currentLocale.toUpperCase().slice(0, 2)}</div>
		</div>
	</a>
	<Menu
		bind:this={localeMenu}
		bind:anchorElement={localeMenuAnchor}
		anchor={false}
		anchorCorner="BOTTOM_LEFT"
	>
		<List>
			<SelectionGroup>
				{#each $locales as _locale}
					<Item on:SMUI:action={() => setLocale(_locale)} selected={_locale === currentLocale}>
						<Text class={_locale === currentLocale && 'font-bold'}
							>{_locale.toUpperCase().slice(0, 2)}</Text
						>
						<SelectionGroupIcon>
							<i class="material-icons">check</i>
						</SelectionGroupIcon>
					</Item>
				{/each}
			</SelectionGroup>
		</List>
	</Menu>
</span>

<style>
	.switcher {
		display: inline-block;
	}
</style>
