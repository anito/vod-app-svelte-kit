<script>
	// @ts-nocheck

	import { onMount, onDestroy, tick } from 'svelte';
	import { inboxes, sents } from '$lib/stores';
	import List from '@smui/list';
	import SimpleMailCard from './_SimpleMailCard.svelte';
	import SvgIcon from './_SvgIcon.svelte';
	import { _ } from 'svelte-i18n';
	import { dev } from '$app/env';

	export let type;
	export let selected = false;
	export let sort = 'DESC';
	export let selectionIndex;

	const mailDevTimeOut = dev ? 800 : 0;

	let mailDevTimeOutId;
	let list;
	let focusItemAtIndex;
	let items;

	$: sortBit = sort === 'DESC' ? -1 : sort === 'ASC' ? 1 : 0;
	$: _mails = (async (type) => {
		let m = type === 'inboxes' ? $inboxes : type === 'sents' ? $sents : [];
		return new Promise((resolve) => {
			clearTimeout(mailDevTimeOutId);
			mailDevTimeOutId = setTimeout(
				() => resolve(m.sort((a, b) => sortBit * (new Date(a.created) - new Date(b.created)))),
				mailDevTimeOut
			);
		})
			.then((res) => {
				return res;
			})
			.then((res) => res);
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

{#await _mails}
	<div class="loader flex justify-center">
		<SvgIcon name="animated-loader-3" size="50" fillColor="var(--prime)" class="mr-2" />
	</div>
{:then _mails}
	<List
		bind:this={list}
		class="mails-list {type}"
		on:SMUIList:mount={receiveListMethods}
		bind:selectedIndex={selectionIndex}
		twoLine
		avatarList
		singleSelection
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
{/await}

<style>
	.loader {
	}
</style>
