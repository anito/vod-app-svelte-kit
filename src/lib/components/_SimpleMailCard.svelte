<script>
	// @ts-nocheck

	import './_meta.scss';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { localeFormat, isToday, INBOX, SENT } from '$lib/utils';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import UserGraphic from './_UserGraphic.svelte';
	import { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
	import { locale } from 'svelte-i18n';

	export let index;
	export let selection = null;
	export let mail;
	export let type;
	export { className as class };

	const dispatch = createEventDispatcher();
	const transitionParams = {
		duration: 100,
		delay: index * 100,
		cubicOut
	};

	let userItems = [];
	let created = '';
	let className = '';

	$: unread = !mail._read;
	$: dateFormat =
		$locale.indexOf('de') != -1
			? isToday(mail.created)
				? 'HH:mm'
				: 'dd.MM yy HH:mm'
			: isToday(mail.created)
			? 'hh:mm a'
			: 'yy-MM-dd hh:mm a';

	$: created = localeFormat(new Date(mail.created), dateFormat);
	$: mail?.id === selection?.id && (selection = mail);

	onMount(() => {
		userItems = type === INBOX ? mail._from : type === SENT ? mail._to : [];
		setTimeout(() => (loaded = true), 100);
	});

	onDestroy(() => {
		selection = null;
		userItems = [];
		dispatch('mail:destroyed');
	});

	function focusHandler(e) {
		selection = mail;
		if (type === INBOX) {
			unread && dispatch('mail:toggleRead', { selection, _read: true });
		}
	}

	function keydownHandler(e) {
		const isBackspace = e.key === 'Backspace' || e.keyCode === 8;
		if (isBackspace) {
			dispatch('mail:delete', { selection });
		}
	}
</script>

<div in:fade class="">
	<div in:fly={{ ...transitionParams, x: 30 }}>
		<Item
			on:focus={(e) => focusHandler(e)}
			on:keydown={(e) => keydownHandler(e)}
			class="{className} {mail._read ? 'read' : 'unread'}"
			selected={selection?.id === mail.id}
			><div class="staggered">
				{#each userItems as user, i}
					<UserGraphic size="30" {user} borderSize style={`z-index: ${10 - i};`} />
				{/each}
			</div>
			<Text style="flex: 1; align-self: auto;">
				<PrimaryText style="display: flex;">
					{#each userItems as user}
						<span class="mr-3 mail-list" class:unread>{user.name || user.email}</span>
					{/each}
				</PrimaryText>
				<SecondaryText style="display: flex; align-items: baseline; justify-content: center;">
					<span class="subject">{mail.subject || '--'}</span><span class="date-created"
						>{created}</span
					>
				</SecondaryText>
			</Text>
		</Item>
	</div>
</div>

<style>
	.unread {
		font-weight: 700;
	}
	.mail-list {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		align-self: unset;
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
