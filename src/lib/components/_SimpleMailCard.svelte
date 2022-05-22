<script context="module">
	let zIndex = 5;
</script>

<script>
	// @ts-nocheck

	import './_meta.scss';
	import { localeFormat, isToday } from '$lib/utils';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import UserGraphic from './_UserGraphic.svelte';
	import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
	import { locale } from 'svelte-i18n';

	export let selected = null;
	export let mail;
	export let type;
	export { className as class };

	const dispatch = createEventDispatcher();

	let userItems = [];
	let created = '';
	let className = '';

	$: unread = !mail.read;
	$: dateFormat =
		$locale.indexOf('de') != -1
			? isToday(mail.created)
				? 'HH:mm'
				: 'dd.MM yy HH:mm'
			: isToday(mail.created)
			? 'hh:mm a'
			: 'yy-MM-dd hh:mm a';

	$: created = localeFormat(new Date(mail.created), dateFormat);

	onMount(() => {
		userItems = type === 'inboxes' ? mail.from : type === 'sents' ? mail.to : [];
	});
	onDestroy(() => {
		selected = null;
		userItems = [];
		dispatch('mail:destroyed');
	});

	function focusHandler(e) {
		selected = mail;
		if (type === 'inboxes') {
			unread && dispatch('mail:toggleRead', { selected, read: true });
		}
	}

	function keydownHandler(e) {
		const isBackspace = e.key === 'Backspace' || e.keyCode === 8;
		if (isBackspace) {
			dispatch('mail:delete', { selected });
		}
	}
</script>

<Item
	on:focus={(e) => focusHandler(e)}
	on:keydown={(e) => keydownHandler(e)}
	class="{className} {mail.read ? 'read' : 'unread'}"
	selected={selected && selected.id === mail.id}
	><div class="staggered">
		{#each userItems as user}
			<UserGraphic
				width="40"
				height="40"
				user={typeof user === 'object' ? user : null}
				borderSize
				style={`z-index: ${(zIndex -= 1)};`}
			/>
		{/each}
	</div>
	<Text style="flex: 1;">
		<PrimaryText>
			{#each userItems as user}
				<span class:unread>{user.name || user}</span>
			{/each}
		</PrimaryText>
		<SecondaryText style="display: flex; align-items: baseline; justify-content: center;">
			<span class="subject">{mail.subject || '--'}</span><span class="date-created">{created}</span>
		</SecondaryText>
	</Text>
</Item>

<style>
	.unread {
		font-weight: 700;
	}
	.subject {
		flex: 1 0 60%;
		padding-right: 10px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.date-created {
		font-size: 0.8em;
		flex: 1 0 40%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		text-align: end;
	}
	:global(.next-active) {
		background: chocolate;
	}
	.staggered :global(.user-graphics-outer:not(:first-child)) {
		margin-left: -36px;
	}
</style>
