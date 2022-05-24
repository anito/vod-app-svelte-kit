<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { sitename } from '$lib/stores';
	import { users } from '$lib/stores';
	import { _ } from 'svelte-i18n';

	let preSelectedIndex = 0;

	onMount(() => {
		if (!$users.length) return;

		let max = $users.length - 1;
		preSelectedIndex = preSelectedIndex < 0 || preSelectedIndex > max ? 0 : preSelectedIndex;

		// goto(`users/${$users[preSelectedIndex].id}`); // commented to prevent to automatically change to first user
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
