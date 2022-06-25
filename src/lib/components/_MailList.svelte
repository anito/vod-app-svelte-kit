<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import { slim } from '$lib/stores';
	import { INBOX, SENT } from '$lib/utils';
	import List from '@smui/list';
	import SimpleMailCard from './_SimpleMailCard.svelte';
	import SvgIcon from './_SvgIcon.svelte';
	import { _ } from 'svelte-i18n';

	export let selection = false;
	export let sort = 'DESC';
	export let selectionIndex;
	export let mailData = [];
	export let currentStore;

	const sortByDate = (a, b) => sortBit * (new Date(a.created) - new Date(b.created));

	let list;
	let focusItemAtIndex;
	let items;

	$: userId = $page.params.slug;
	$: sortBit = sort === 'DESC' ? -1 : sort === 'ASC' ? 1 : 0;
	$: activeItem = $page.url.searchParams.get('active');

	onMount(() => {});

	/**
	 * Find the user for each email address in the email
	 * @param addressees
	 */
	const parseUsernames = (addressees) => {
		let item,
			items = [];
		addressees.forEach((email) => {
			item = $slim.find((user) => user.email === email);
			items.push(item ? { ...item } : { email });
		});
		return items;
	};

	function parseMail(mail) {
		if (activeItem === INBOX) return parseInbox(mail);
		if (activeItem === SENT) return parseSent(mail);
	}

	function parseInbox(mail) {
		let message = JSON.parse(mail.message);
		return {
			id: mail.id,
			from: parseUsernames([mail.from]),
			to: [userId],
			message: message.message,
			subject: message.subject,
			_read: mail._read,
			created: mail.created
		};
	}

	function parseSent(mail) {
		let message = JSON.parse(mail.message);
		let to = mail.to.split(';');
		return {
			id: mail.id,
			from: mail.from,
			to: parseUsernames(to),
			message: message.message,
			subject: message.subject,
			created: mail.created,
			_read: true
		};
	}

	async function afterMailDestroyedHandler(e) {
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

{#await mailData}
	<div class="loader flex justify-center">
		<SvgIcon name="animated-loader-3" size="50" fillColor="var(--prime)" class="mr-2" />
	</div>
{:then mails}
	<List
		bind:this={list}
		class="mails-list list-{activeItem}"
		on:SMUIList:mount={receiveListMethods}
		bind:selectedIndex={selectionIndex}
		twoLine
		avatarList
		singleSelection
	>
		{#each sort && $currentStore.sort(sortByDate) as mail (mail.id)}
			<SimpleMailCard
				on:mail:delete
				on:mail:toggleRead
				on:mail:destroyed={(e) => afterMailDestroyedHandler(e)}
				bind:selection
				mail={parseMail(mail)}
				type={activeItem}
			/>
		{/each}
	</List>
{:catch reason}
	{reason}
{/await}

<style>
</style>
