<script>
	// @ts-nocheck

	import './_meta.scss';
	import { infos } from '$lib/stores';
	import UserGraphic from './_UserGraphic.svelte';
	import Dot from './_Dot.svelte';
	import { Meta, Item, Text, PrimaryText, SecondaryText } from '@smui/list';

	export let selectionUserId;
	export let user;
	export { className as class };

	let className = '';

	$: _infos = ($infos.has(user.id) && $infos.get(user.id).params) || [];
</script>

<Item class={className} selected={selectionUserId == user.id}>
	<UserGraphic
		width="40"
		height="40"
		{user}
		badge={user.group.name === 'Administrator' && {
			icon: 'admin_panel_settings',
			color: 'rgb(206, 4, 4)'
		}}
		borderSize="1"
		borderColor="#c5c5c5"
	/>
	<Text>
		<PrimaryText>{user.name}</PrimaryText>
		<SecondaryText>{user.email}</SecondaryText>
	</Text>
	{#if user.protected}
		<Meta class="material-icons locked">lock</Meta>
	{/if}
	<div class="infos">
		{#each _infos as _info}
			<Dot size="5" color={_info.flag} />
		{/each}
	</div>
</Item>

<style>
	.infos {
		margin-left: auto;
		margin-right: 0;
	}
	:global(.locked) {
		position: absolute;
		top: 0;
		right: 0;
		margin: 3px;
		font-size: 0.7em;
	}
</style>
