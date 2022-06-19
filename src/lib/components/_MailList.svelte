<script>
	// @ts-nocheck

	import { onMount, onDestroy, tick } from 'svelte';
	import { inboxes, sents } from '$lib/stores';
	import List from '@smui/list';
	import SimpleMailCard from './_SimpleMailCard.svelte';
	import { _ } from 'svelte-i18n';

	export let type;
	export let selected = false;
	export let sort = 'DESC';
	export let selectionIndex;

	let list;
	let focusItemAtIndex;
	let items;

	$: sortBit = sort === 'DESC' ? -1 : sort === 'ASC' ? 1 : 0;
	$: _mails = ((type) => {
		let m = type === 'inboxes' ? $inboxes : type === 'sents' ? $sents : [];
		return m.sort((a, b) => sortBit * (new Date(a.created) - new Date(b.created)));
	})(type);

	onMount(() => {});
	onDestroy(() => {});

	async function mailDestroyedHandler(e) {
		await tick();
		if (!list) return;

		let index = list.getSelectedIndex();
		if (items.length >= index + 1) {
			selectionIndex = index;
		} else {
			selectionIndex = index - 1;
		}
		focusItemAtIndex(selectionIndex);
	}

	function receiveListMethods(e) {
		({ focusItemAtIndex, items } = { ...e.detail });
	}
</script>

<List
	bind:this={list}
	class="mails-list {type}"
	on:SMUIList:mount={receiveListMethods}
	twoLine
	avatarList
	singleSelection
	bind:selectedIndex={selectionIndex}
>
	{#each _mails as mail (mail.id)}
		<SimpleMailCard
			on:mail:delete
			on:mail:toggleRead
			on:mail:destroyed={(e) => mailDestroyedHandler(e)}
			bind:selected
			{mail}
			{type}
		/>
	{/each}
</List>

<style>
</style>
