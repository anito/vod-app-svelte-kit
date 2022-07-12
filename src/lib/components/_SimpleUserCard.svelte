<script>
	// @ts-nocheck

	import './_meta.scss';
	import { infos } from '$lib/stores';
	import UserGraphic from './_UserGraphic.svelte';
	import Dot from './_Dot.svelte';
	import { Meta, Item, Text, PrimaryText, SecondaryText } from '@smui/list';
	import { ADMIN, SUPERUSER } from '$lib/utils';

	export let selectionUserId;
	export let user;
	export { className as class };

	let className = '';

	$: _infos = ($infos.has(user.id) && $infos.get(user.id).params) || [];
	$: hasPrivileges = user.role === ADMIN || user.role === SUPERUSER;
	$: isSuperUser = user.role === SUPERUSER;
</script>

<Item class={className} selected={selectionUserId == user.id}>
	<UserGraphic
		size="40"
		{user}
		badge={hasPrivileges && {
			icon: 'admin_panel_settings',
			color: isSuperUser ? 'rgb(26, 4, 4)' : 'rgb(206, 4, 4)',
			position: 'TOP_RIGHT'
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
