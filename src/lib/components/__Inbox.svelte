<script>
	import * as api from '$lib/api';
	import List from '@smui/list';
	import SimpleMailCard from './_SimpleMailCard.svelte';

	export let selected;
	export let user;

	let selectionIndex;
</script>

<List class="mails-list" twoLine avatarList singleSelection bind:selectedIndex={selectionIndex}>
	{#each user.mails as mail (mail.id)}
		<SimpleMailCard bind:selected item={{ user, mail }} />
	{/each}
</List>

<style>
</style>
