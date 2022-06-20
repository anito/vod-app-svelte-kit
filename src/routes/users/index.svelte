<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { sitename } from '$lib/stores';
	import { users } from '$lib/stores';
	import { _ } from 'svelte-i18n';

	onMount(() => {
		if (!$users.length) return;
		setTimeout(() => goto(`/users/${$users[0].id}`), 100);
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
