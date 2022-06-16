<script>
	// @ts-nocheck

	import { users, infos } from '$lib/stores';

	export let selectionUserId;

	$: user = $users.find((usr) => usr.id === selectionUserId);
	$: userInfos = (user && $infos.has(user.id) && $infos.get(user.id).params) || [];
</script>

<div class="info">
	{#each userInfos as info}
		<div class="chip warning {info.value}">
			<i class="material-icons mdc-button__icon mr-1">circle_notifications</i>
			{info.label}
		</div>
	{/each}
</div>

<style>
</style>
